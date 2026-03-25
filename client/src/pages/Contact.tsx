import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactMessageSchema, type InsertContactMessage } from "@shared/schema";
import { useSubmitContact } from "@/hooks/use-content";
import { PageHeader } from "@/components/PageHeader";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Contact() {
  const { toast } = useToast();
  const mutation = useSubmitContact();
  
  const form = useForm<InsertContactMessage>({
    resolver: zodResolver(insertContactMessageSchema),
    defaultValues: {
      name: "",
      email: "",
      message: ""
    }
  });

  const onSubmit = (data: InsertContactMessage) => {
    mutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: "¡Mensaje enviado!",
          description: "Gracias por contactarnos. Te responderemos lo antes posible.",
        });
        form.reset();
      },
      onError: (error) => {
        toast({
          title: "Error al enviar",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  return (
    <>
      <PageHeader 
        title="Estamos aquí para ti" 
        description="¿Tienes preguntas, ideas o quieres colaborar? Escríbenos, nos encantará escucharte."
      />
      
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16">
            
            {/* Contact Info */}
            <div className="space-y-10">
              <div>
                <h3 className="text-2xl font-bold font-display mb-6">Información de contacto</h3>
                <div className="space-y-6">
                  <ContactDetail 
                    icon={<Mail className="w-6 h-6" />}
                    title="Email"
                    content="info@alumnossolidarios.org"
                  />
                  <ContactDetail 
                    icon={<Phone className="w-6 h-6" />}
                    title="Teléfono"
                    content="+34 900 000 000"
                  />
                  <ContactDetail 
                    icon={<MapPin className="w-6 h-6" />}
                    title="Oficina"
                    content="Calle Ejemplo 123, 28000 Madrid, España"
                  />
                </div>
              </div>
              
              <div className="bg-accent/30 p-8 rounded-2xl">
                <h4 className="font-bold font-display text-lg mb-2">Horario de atención</h4>
                <p className="text-muted-foreground">
                  Lunes a Viernes: 9:00 - 18:00<br />
                  Fines de semana: Cerrado
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-border/40">
              <h3 className="text-2xl font-bold font-display mb-2">Envíanos un mensaje</h3>
              <p className="text-muted-foreground mb-8">Completa el formulario y te contactaremos.</p>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Tu nombre" className="rounded-xl py-6" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo electrónico</FormLabel>
                        <FormControl>
                          <Input placeholder="tucorreo@ejemplo.com" className="rounded-xl py-6" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensaje</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="¿En qué podemos ayudarte?" 
                            className="rounded-xl min-h-[150px] resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <button 
                    type="submit" 
                    disabled={mutation.isPending}
                    className="w-full btn-primary py-4 text-lg rounded-xl flex items-center justify-center gap-2"
                  >
                    {mutation.isPending ? "Enviando..." : (
                      <>Enviar Mensaje <Send className="w-5 h-5" /></>
                    )}
                  </button>
                </form>
              </Form>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

function ContactDetail({ icon, title, content }: { icon: React.ReactNode; title: string; content: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-bold text-foreground">{title}</p>
        <p className="text-muted-foreground text-lg">{content}</p>
      </div>
    </div>
  );
}
