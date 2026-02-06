import { GenericPage } from "./GenericPage";

export function AvisoLegal() {
  return (
    <GenericPage title="Aviso Legal" description="Información legal sobre el titular del sitio web.">
      <p>En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y Comercio Electrónico...</p>
      {/* Add full legal text here */}
    </GenericPage>
  );
}

export function Privacidad() {
  return (
    <GenericPage title="Política de Privacidad" description="Cómo tratamos tus datos personales.">
      <p>Nos tomamos muy en serio la privacidad de tus datos. De conformidad con el RGPD...</p>
      {/* Add full privacy text here */}
    </GenericPage>
  );
}
