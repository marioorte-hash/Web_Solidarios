import { PageHeader } from "@/components/PageHeader";
import { ActivityCard } from "@/components/Card";
import { useActivities } from "@/hooks/use-content";
import { useLanguage, localizedText } from "@/contexts/language";

export default function Activities() {
  const { data: activities, isLoading } = useActivities();
  const { lang } = useLanguage();

  return (
    <>
      <PageHeader
        title="Un Recorrido por Nuestra Historia"
        description="A lo largo de los años, impulsados desde la Dirección del Colegio madrileño JOYFE, hemos realizado infinidad de acciones de sensibilización con todo tipo de fines."
      />

      <section className="py-20 bg-white">
        <div className="container-custom">
          {isLoading ? (
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="space-y-8 max-w-4xl mx-auto">
              {activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  title={localizedText(activity.title, activity.titleEn, activity.titleDe, lang)}
                  description={localizedText(activity.description, activity.descriptionEn, activity.descriptionDe, lang)}
                  imageUrl={activity.imageUrl}
                  date={activity.date}
                  location={activity.location}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No hay actividades programadas próximamente.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
