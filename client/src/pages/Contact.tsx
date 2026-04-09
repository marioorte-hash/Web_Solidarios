import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactMessageSchema, type InsertContactMessage } from "@shared/schema";
import { useSubmitContact } from "@/hooks/use-content";
import { PageHeader } from "@/components/PageHeader";
import { Mail, Phone, MapPin, Send, Clock, Instagram } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useT, T } from "@/contexts/language";

export default function Contact() {
  const { toast } = useToast();
  const mutation = useSubmitContact();
  const tr = useT();
  
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
          title: tr(T.contact.successTitle),
          description: tr(T.contact.successDesc),
        });
        form.reset();
      },
      onError: (error) => {
        toast({
          title: tr(T.contact.errorTitle),
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  return (
    <>
      <PageHeader 
        title={tr(T.contact.pageTitle)}
        description={tr(T.contact.pageDesc)}
      />
      
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16">
            
            {/* Contact Info */}
            <div className="space-y-10">
              <div>
                <h3 className="text-2xl font-bold font-display mb-6">{tr(T.contact.infoTitle)}</h3>
                <div className="space-y-6">
                  <ContactDetail 
                    icon={<Mail className="w-6 h-6" />}
                    title={tr(T.contact.email)}
                    content="info@alumnossolidarios.org"
                  />
                  <ContactDetail 
                    icon={<Phone className="w-6 h-6" />}
                    title={tr(T.contact.phone)}
                    content="+34 620 363 285"
                  />
                  <ContactDetail 
                    icon={<MapPin className="w-6 h-6" />}
                    title={tr(T.contact.address)}
                    content="Calle Vital Aza 65, Madrid"
                  />
                  <ContactDetail 
                    icon={<Clock className="w-6 h-6" />}
                    title={tr(T.contact.hours)}
                    content={tr(T.contact.hoursValue)}
                  />
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Instagram className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">Instagram</p>
                      <a
                        href="https://www.instagram.com/alumnos_solidarios/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-lg hover:underline"
                      >
                        @alumnos_solidarios
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-border/40">
              <h3 className="text-2xl font-bold font-display mb-2">{tr(T.contact.formTitle)}</h3>
              <p className="text-muted-foreground mb-8">{tr(T.contact.formDesc)}</p>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{tr(T.contact.name)}</FormLabel>
                        <FormControl>
                          <Input placeholder={tr(T.contact.namePlaceholder)} className="rounded-xl py-6" {...field} />
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
                        <FormLabel>{tr(T.contact.emailLabel)}</FormLabel>
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
                        <FormLabel>{tr(T.contact.message)}</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={tr(T.contact.messagePlaceholder)}
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
                    {mutation.isPending ? tr(T.contact.sending) : (
                      <>{tr(T.contact.send)} <Send className="w-5 h-5" /></>
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
