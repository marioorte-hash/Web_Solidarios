import { Link } from "wouter";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface NewsCardProps {
  title: string;
  summary: string;
  imageUrl: string;
  date?: string | Date;
  id: number;
}

export function NewsCard({ title, summary, imageUrl, date, id }: NewsCardProps) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-border/40 shadow-sm card-hover flex flex-col h-full">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        {date && (
          <div className="flex items-center gap-2 text-xs font-bold text-primary mb-3 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            {format(new Date(date), "d MMM, yyyy", { locale: es })}
          </div>
        )}
        <h3 className="text-xl font-bold font-display text-foreground mb-3 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
          {summary}
        </p>
        <Link href={`/news/${id}`} className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all">
          Leer más <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

interface ActivityCardProps {
  title: string;
  description: string;
  imageUrl: string;
  date: string | Date;
  location: string;
}

export function ActivityCard({ title, description, imageUrl, date, location }: ActivityCardProps) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-border/40 shadow-sm card-hover flex flex-col md:flex-row h-full">
      <div className="md:w-2/5 relative overflow-hidden h-48 md:h-auto">
         <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-6 md:p-8 flex flex-col flex-grow justify-center">
        <div className="flex flex-wrap gap-4 mb-4 text-sm font-medium text-muted-foreground">
          <span className="flex items-center gap-1.5 bg-secondary px-3 py-1 rounded-full">
            <Calendar className="w-4 h-4 text-primary" />
            {format(new Date(date), "PPp", { locale: es })}
          </span>
          <span className="flex items-center gap-1.5 bg-secondary px-3 py-1 rounded-full">
            <MapPin className="w-4 h-4 text-primary" />
            {location}
          </span>
        </div>
        <h3 className="text-2xl font-bold font-display text-foreground mb-3 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-6">
          {description}
        </p>
        <div>
          <button className="text-primary font-bold hover:underline">
            Inscribirse a esta actividad
          </button>
        </div>
      </div>
    </div>
  );
}
