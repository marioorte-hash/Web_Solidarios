import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLogin, useRegister } from "@/hooks/use-auth";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Introduce tu contraseña"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const login = useLogin();
  const register = useRegister();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", email: "", password: "" },
  });

  const onLogin = loginForm.handleSubmit(async (data) => {
    try {
      await login.mutateAsync(data);
      toast({ title: "¡Bienvenido!", description: "Has iniciado sesión correctamente." });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  const onRegister = registerForm.handleSubmit(async (data) => {
    try {
      await register.mutateAsync(data);
      toast({ title: "¡Cuenta creada!", description: "Te has registrado correctamente." });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent/20 pt-20 pb-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-lg border border-border/20 overflow-hidden">
          {/* Tabs */}
          <div className="flex">
            <button
              data-testid="tab-login"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 text-sm font-bold transition-colors ${isLogin ? "bg-primary text-white" : "bg-gray-50 text-foreground/60 hover:text-foreground"}`}
            >
              Iniciar sesión
            </button>
            <button
              data-testid="tab-register"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 text-sm font-bold transition-colors ${!isLogin ? "bg-primary text-white" : "bg-gray-50 text-foreground/60 hover:text-foreground"}`}
            >
              Registrarse
            </button>
          </div>

          <div className="p-8">
            {isLogin ? (
              <>
                <div className="text-center mb-8">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LogIn className="w-7 h-7 text-primary" />
                  </div>
                  <h1 className="text-2xl font-display font-bold">¡Bienvenido de nuevo!</h1>
                  <p className="text-muted-foreground text-sm mt-1">Accede a tu cuenta</p>
                </div>
                <Form {...loginForm}>
                  <form onSubmit={onLogin} className="space-y-5">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input data-testid="input-email" type="email" placeholder="tu@email.com" className="rounded-xl" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input data-testid="input-password" type={showPassword ? "text" : "password"} placeholder="••••••" className="rounded-xl pr-10" {...field} />
                              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button data-testid="button-login" type="submit" className="w-full rounded-full" disabled={login.isPending}>
                      {login.isPending ? "Accediendo..." : "Iniciar sesión"}
                    </Button>
                  </form>
                </Form>
              </>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-7 h-7 text-primary" />
                  </div>
                  <h1 className="text-2xl font-display font-bold">Crea tu cuenta</h1>
                  <p className="text-muted-foreground text-sm mt-1">Únete a nuestra comunidad</p>
                </div>
                <Form {...registerForm}>
                  <form onSubmit={onRegister} className="space-y-5">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de usuario</FormLabel>
                          <FormControl>
                            <Input data-testid="input-username" placeholder="tunombre" className="rounded-xl" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input data-testid="input-email-register" type="email" placeholder="tu@email.com" className="rounded-xl" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input data-testid="input-password-register" type={showPassword ? "text" : "password"} placeholder="Mínimo 6 caracteres" className="rounded-xl pr-10" {...field} />
                              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button data-testid="button-register" type="submit" className="w-full rounded-full" disabled={register.isPending}>
                      {register.isPending ? "Creando cuenta..." : "Registrarse"}
                    </Button>
                  </form>
                </Form>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
