"""Sportswear kit builder — MT1c VIA 2 (asset auto-prodotto, EUR 0).

Deriva un kit calcio (maglia con maniche integrate + colletto, pantaloncini,
calzettoni) dalle REGIONI ANATOMICHE di una base mesh umana CC0 (MakeHuman
base.obj). NON usa primitive: seleziona le facce del corpo per bande di altezza
(torso/braccia superiori -> maglia+maniche+colletto, bacino -> pantaloncini,
polpacci -> calzettoni), le separa, poi solidify + subsurf per dare spessore e
morbidezza al guscio-indumento. 5 slot-materiale nominati, UV cilindrica pulita
per zona, export GLB sotto i 150k tris.

Uso headless:
  Blender --background --python kit_build.py -- <base.obj> <out.glb>

Fonte base CC0 e licenza: vedi configurator/ASSET_LICENSE.md.
"""

import sys
import bpy
import bmesh
from mathutils import Vector

# ---------------------------------------------------------------- parametri
# Bande verticali come frazione dell'altezza (0 = piedi, 1 = apice testa).
# Tarate sulle proporzioni della base mesh MakeHuman hm08 (posa in piedi,
# braccia lungo i fianchi).
SOCK_LOW, SOCK_HIGH = 0.06, 0.30        # calzettoni: caviglia -> sotto ginocchio
SHORT_LOW, SHORT_HIGH = 0.40, 0.52      # pantaloncini: coscia alta -> vita
JERSEY_LOW, JERSEY_HIGH = 0.52, 0.83    # maglia (torso)
SLEEVE_LOW, SLEEVE_HIGH = 0.70, 0.83    # maniche CORTE: solo braccio superiore
COLLAR_LOW, COLLAR_HIGH = 0.83, 0.86    # colletto: anello sottile attorno al collo

# Una faccia con |x| oltre questa frazione di xmax, nella banda maglia, e' braccio.
SLEEVE_X_FRAC = 0.44
# Il collo e' centrale e sottile: raggio orizzontale entro questa frazione di xmax.
COLLAR_R_FRAC = 0.18
# Pantaloncini/calzettoni: solo la parte centrale (gambe/bacino), esclude braccia/mani.
LIMB_X_FRAC = 0.44

# Slot materiale (ordine = material_index)
SLOT_BODY, SLOT_SLEEVES, SLOT_COLLAR, SLOT_SHORTS, SLOT_SOCKS = 0, 1, 2, 3, 4
MAT_SPECS = [
    ("body",    (0.80, 0.10, 0.12, 1.0)),   # rosso
    ("sleeves", (0.10, 0.28, 0.80, 1.0)),   # blu
    ("collar",  (0.92, 0.92, 0.92, 1.0)),   # bianco
    ("shorts",  (0.10, 0.11, 0.16, 1.0)),   # blu notte
    ("socks",   (0.10, 0.70, 0.32, 1.0)),   # verde
]

SOLIDIFY_FRAC = 0.006   # spessore guscio come frazione dell'altezza (~1 cm reale)
SUBSURF_LEVELS = 1
TRI_BUDGET = 150000
TARGET_HEIGHT = 2.0     # normalizza il kit a 2 unita' di altezza, centrato in origine


def argv_after_dashes():
    a = sys.argv
    return a[a.index("--") + 1:] if "--" in a else []


def classify_face(zc, xabs, xmax):
    """Ritorna lo slot-materiale per la faccia, o None se va scartata.

    zc  = z normalizzato (0..1) del centroide faccia
    xabs = |x| assoluto del centroide
    xmax = |x| massimo della mesh (mezza apertura braccia)
    """
    xn = xabs / xmax if xmax else 0.0
    # colletto: banda collo, centrale (tubo attorno al collo)
    if COLLAR_LOW <= zc <= COLLAR_HIGH and xn <= COLLAR_R_FRAC:
        return SLOT_COLLAR
    # maniche: banda braccio, lontano dall'asse (braccia lungo i fianchi)
    if SLEEVE_LOW <= zc <= SLEEVE_HIGH and xn > SLEEVE_X_FRAC:
        return SLOT_SLEEVES
    # maglia corpo: banda torso, vicino all'asse
    if JERSEY_LOW <= zc <= JERSEY_HIGH and xn <= SLEEVE_X_FRAC:
        return SLOT_BODY
    # pantaloncini: banda bacino/coscia alta, solo parte centrale (no braccia/mani)
    if SHORT_LOW <= zc <= SHORT_HIGH and xn <= LIMB_X_FRAC:
        return SLOT_SHORTS
    # calzettoni: banda polpaccio, parte centrale
    if SOCK_LOW <= zc <= SOCK_HIGH and xn <= LIMB_X_FRAC:
        return SLOT_SOCKS
    return None


def build():
    argv = argv_after_dashes()
    if len(argv) < 2:
        raise SystemExit("uso: -- <base.obj> <out.glb>")
    base_obj, out_glb = argv[0], argv[1]

    bpy.ops.wm.read_factory_settings(use_empty=True)
    # OBJ MakeHuman e' Y-up: i default (forward -Z, up Y) lo raddrizzano in Z-up.
    bpy.ops.wm.obj_import(filepath=base_obj)
    base = bpy.context.selected_objects[0]

    # bounding box in coordinate mondo
    mw = base.matrix_world
    coords = [mw @ v.co for v in base.data.vertices]
    zmin = min(c.z for c in coords)
    zmax = max(c.z for c in coords)
    H = zmax - zmin
    xmax = max(abs(c.x) for c in coords) or 1.0
    print(f"[kit] base bbox z=[{zmin:.3f},{zmax:.3f}] H={H:.3f} xmax={xmax:.3f}")

    # applica la trasformazione cosi' bmesh lavora in coordinate finali
    bpy.context.view_layer.objects.active = base
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    me = base.data
    bm = bmesh.new()
    bm.from_mesh(me)
    bm.faces.ensure_lookup_table()

    counts = {i: 0 for i in range(5)}
    del_faces = []
    keep_slot = {}  # face index -> slot
    for f in bm.faces:
        c = f.calc_center_median()
        zc = (c.z - zmin) / H
        slot = classify_face(zc, abs(c.x), xmax)
        if slot is None:
            del_faces.append(f)
        else:
            keep_slot[f.index] = slot
            counts[slot] += 1

    print("[kit] facce per zona:", {MAT_SPECS[i][0]: counts[i] for i in range(5)})
    for i in range(5):
        if counts[i] == 0:
            raise SystemExit(f"[kit] ERRORE: zona '{MAT_SPECS[i][0]}' vuota — bande da ritarare")

    # scrivi material_index sui poligoni PRIMA di cancellare (serve mappa stabile):
    # cancella le facce non tenute, poi i vertici sciolti.
    bmesh.ops.delete(bm, geom=del_faces, context='FACES')
    loose = [v for v in bm.verts if not v.link_faces]
    if loose:
        bmesh.ops.delete(bm, geom=loose, context='VERTS')
    bm.to_mesh(me)
    bm.free()

    # 5 materiali nominati — appesi PRIMA di assegnare material_index
    # (clear() dopo l'assegnazione azzererebbe gli indici a 0)
    me.materials.clear()
    for name, rgba in MAT_SPECS:
        mat = bpy.data.materials.new(name)
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs["Base Color"].default_value = rgba
            bsdf.inputs["Roughness"].default_value = 0.6
        me.materials.append(mat)

    # ri-assegna material_index sull'oggetto finale ricalcolando per centroide
    # (gli indici faccia sono cambiati dopo la delete)
    for poly in me.polygons:
        c = poly.center  # spazio oggetto (trasformazione gia' applicata)
        zc = (c.z - zmin) / H
        slot = classify_face(zc, abs(c.x), xmax)
        poly.material_index = slot if slot is not None else SLOT_BODY

    obj = base
    obj.name = "kit"

    # solidify (spessore indumento) + subsurf (morbidezza)
    sld = obj.modifiers.new("solidify", 'SOLIDIFY')
    sld.thickness = SOLIDIFY_FRAC * H
    sld.offset = 0.0
    sld.use_rim = True
    bpy.ops.object.modifier_apply(modifier="solidify")

    sub = obj.modifiers.new("subsurf", 'SUBSURF')
    sub.levels = SUBSURF_LEVELS
    sub.render_levels = SUBSURF_LEVELS
    bpy.ops.object.modifier_apply(modifier="subsurf")

    bpy.ops.object.shade_smooth()

    # budget triangoli: decimate collapse se sforo
    me = obj.data
    me.calc_loop_triangles()
    tris = len(me.loop_triangles)
    print(f"[kit] tris dopo subsurf = {tris}")
    if tris > TRI_BUDGET:
        ratio = (TRI_BUDGET * 0.93) / tris
        dec = obj.modifiers.new("decimate", 'DECIMATE')
        dec.ratio = ratio
        bpy.ops.object.modifier_apply(modifier="decimate")
        me.calc_loop_triangles()
        tris = len(me.loop_triangles)
        print(f"[kit] tris dopo decimate (ratio={ratio:.3f}) = {tris}")

    # normalizza scala/posizione: altezza TARGET_HEIGHT, bbox centrata in origine
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    coords = [v.co for v in obj.data.vertices]
    zlo = min(c.z for c in coords); zhi = max(c.z for c in coords)
    cx = sum(c.x for c in coords) / len(coords)
    cy = sum(c.y for c in coords) / len(coords)
    s = TARGET_HEIGHT / (zhi - zlo)
    for v in obj.data.vertices:
        v.co = Vector(((v.co.x - cx) * s, (v.co.y - cy) * s, (v.co.z - (zlo + zhi) / 2) * s))
    obj.data.update()

    # UV cilindrica per l'intero kit (asse Z): u = angolo, v = altezza.
    # Deterministica e headless-safe; adatta a pattern/strisce/nome-numero.
    import math
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    uv_layer = bm.loops.layers.uv.new("UVMap")
    vz = [v.co.z for v in bm.verts]
    zlo2, zhi2 = min(vz), max(vz)
    span = (zhi2 - zlo2) or 1.0
    bad = 0
    for f in bm.faces:
        for loop in f.loops:
            co = loop.vert.co
            u = (math.atan2(co.y, co.x) / (2 * math.pi)) + 0.5
            v = (co.z - zlo2) / span
            if not (math.isfinite(u) and math.isfinite(v)):
                bad += 1
                u, v = 0.0, 0.0
            loop[uv_layer].uv = (u, v)
    bm.to_mesh(obj.data)
    bm.free()
    print(f"[kit] UV cilindrica applicata (loop non-finiti={bad})")

    # export GLB (solo il kit)
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.export_scene.gltf(
        filepath=out_glb,
        export_format='GLB',
        use_selection=True,
        export_apply=True,
        export_materials='EXPORT',
    )
    print(f"[kit] GLB scritto: {out_glb}")
    print(f"[kit] RIEPILOGO tris={tris} materiali={[m[0] for m in MAT_SPECS]}")


if __name__ == "__main__":
    build()
