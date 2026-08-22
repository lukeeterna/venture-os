import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text } from "@medusajs/ui"

const SportswearPage = () => {
  return (
    <div className="flex flex-col gap-y-3">
      <Container className="p-6">
        <Heading level="h1">Sportswear · listino squadra</Heading>
        <Text className="mt-2 text-ui-fg-subtle">
          Il configuratore legge tessuti, supplementi e fasce quantità da Medusa. I prezzi reali si gestiscono qui, mai nel JavaScript del configuratore.
        </Text>
      </Container>
      <Container className="p-6">
        <Heading level="h2">1. Prezzi base</Heading>
        <Text className="mt-2">Apri Prodotti e modifica le varianti dei due prodotti “Sportswear — Tessuti” e “Sportswear — Personalizzazioni”.</Text>
        <a className="mt-3 inline-block text-ui-fg-interactive" href="/app/products">Apri Prodotti →</a>
      </Container>
      <Container className="p-6">
        <Heading level="h2">2. Offerte per quantità</Heading>
        <Text className="mt-2">Crea o modifica un Listino prezzi e aggiungi tier con quantità minima/massima. Medusa seleziona automaticamente il tier migliore nel preventivo.</Text>
        <a className="mt-3 inline-block text-ui-fg-interactive" href="/app/price-lists">Apri Listini prezzi →</a>
      </Container>
      <Container className="p-6">
        <Heading level="h2">SKU collegati al configuratore</Heading>
        <Text className="mt-2">FABRIC_* per i tessuti; CUSTOM_NAME, BACK_NUMBER, FRONT_NUMBER, GRAPHIC_LOGO, GRAPHIC_SPONSOR, GRAPHIC_PATCH, GRAPHIC_BADGE, CUSTOM_PATTERN e CUSTOM_COLLAR per i supplementi.</Text>
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({ label: "Sportswear" })
export default SportswearPage
