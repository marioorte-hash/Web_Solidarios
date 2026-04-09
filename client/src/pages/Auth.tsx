import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, UserPlus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLogin, useRegister } from "@/hooks/use-auth";
import { useT, T } from "@/contexts/language";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-500 mt-1">{message}</p>;
}

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const login = useLogin();
  const register = useRegister();
  const tr = useT();

  const loginSchema = z.object({
    email: z.string().email(tr(T.auth.invalidEmail)),
    password: z.string().min(1, tr(T.auth.requiredPassword)),
  });

  const registerSchema = z.object({
    username: z.string().min(3, tr(T.auth.minChars3)),
    email: z.string().email(tr(T.auth.invalidEmail)),
    password: z.string().min(6, tr(T.auth.minChars6)),
    acceptTerms: z.boolean().refine((v) => v === true, {
      message: tr(T.auth.acceptTerms),
    }),
  });

  type LoginData = z.infer<typeof loginSchema>;
  type RegisterData = z.infer<typeof registerSchema>;

  const {
    register: loginRegister,
    handleSubmit: loginHandleSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const {
    register: regRegister,
    handleSubmit: regHandleSubmit,
    watch: regWatch,
    setValue: regSetValue,
    formState: { errors: regErrors },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", email: "", password: "", acceptTerms: false },
  });

  const acceptTermsValue = regWatch("acceptTerms");

  const onLogin = loginHandleSubmit(async (data) => {
    try {
      await login.mutateAsync(data);
      toast({ title: tr(T.auth.welcome), description: tr(T.auth.loginSuccess) });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  const onRegister = regHandleSubmit(async (data) => {
    try {
      const { acceptTerms, ...registerData } = data;
      await register.mutateAsync(registerData);
      toast({ title: tr(T.auth.accountCreated), description: tr(T.auth.registerSuccess) });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  const inputClass = "w-full h-10 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors";

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
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 text-sm font-bold transition-colors ${isLogin ? "bg-primary text-white" : "bg-gray-50 text-foreground/60 hover:text-foreground"}`}
            >
              {tr(T.auth.loginTitle)}
            </button>
            <button
              data-testid="tab-register"
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 text-sm font-bold transition-colors ${!isLogin ? "bg-primary text-white" : "bg-gray-50 text-foreground/60 hover:text-foreground"}`}
            >
              {tr(T.auth.registerTitle)}
            </button>
          </div>

          <div className="p-8">
            {isLogin ? (
              <>
                <div className="text-center mb-8">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LogIn className="w-7 h-7 text-primary" />
                  </div>
                  <h1 className="text-2xl font-display font-bold">{tr(T.auth.loginTitle)}</h1>
                  <p className="text-muted-foreground text-sm mt-1">{tr(T.auth.loginSubtitle)}</p>
                </div>
                <form onSubmit={onLogin} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{tr(T.auth.email)}</label>
                    <input
                      data-testid="input-email"
                      type="text"
                      autoComplete="email"
                      placeholder="tu@email.com"
                      className={inputClass}
                      {...loginRegister("email")}
                    />
                    <FieldError message={loginErrors.email?.message} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{tr(T.auth.password)}</label>
                    <div className="relative">
                      <input
                        data-testid="input-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••"
                        className={`${inputClass} pr-10`}
                        {...loginRegister("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <FieldError message={loginErrors.password?.message} />
                  </div>
                  <Button data-testid="button-login" type="submit" className="w-full rounded-full" disabled={login.isPending}>
                    {login.isPending ? tr(T.auth.loggingIn) : tr(T.auth.loginBtn)}
                  </Button>
                </form>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-7 h-7 text-primary" />
                  </div>
                  <h1 className="text-2xl font-display font-bold">{tr(T.auth.registerTitle)}</h1>
                  <p className="text-muted-foreground text-sm mt-1">{tr(T.auth.registerSubtitle)}</p>
                </div>
                <form onSubmit={onRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{tr(T.auth.username)}</label>
                    <input
                      data-testid="input-username"
                      type="text"
                      autoComplete="username"
                      placeholder="tunombre"
                      className={inputClass}
                      {...regRegister("username")}
                    />
                    <FieldError message={regErrors.username?.message} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{tr(T.auth.email)}</label>
                    <input
                      data-testid="input-email-register"
                      type="text"
                      autoComplete="email"
                      placeholder="tu@email.com"
                      className={inputClass}
                      {...regRegister("email")}
                    />
                    <FieldError message={regErrors.email?.message} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{tr(T.auth.password)}</label>
                    <div className="relative">
                      <input
                        data-testid="input-password-register"
                        type={showRegisterPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder={tr(T.auth.minChars6)}
                        className={`${inputClass} pr-10`}
                        {...regRegister("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <FieldError message={regErrors.password?.message} />
                  </div>

                  {/* Privacy & Terms */}
                  <div className="rounded-xl bg-accent/40 border border-primary/10 p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {tr(T.auth.privacyLabel)} <strong>Alumnos Solidarios</strong>. {tr(T.auth.acceptTerms)}.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <input
                        data-testid="checkbox-accept-terms"
                        type="checkbox"
                        id="acceptTerms"
                        className="mt-0.5 h-4 w-4 accent-primary cursor-pointer"
                        checked={acceptTermsValue}
                        onChange={(e) => regSetValue("acceptTerms", e.target.checked, { shouldValidate: true })}
                      />
                      <label htmlFor="acceptTerms" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
                        {tr(T.auth.privacyLabel)}{" "}
                        <a href="/privacidad" className="text-primary underline">{tr(T.auth.privacyLink)}</a>
                      </label>
                    </div>
                    <FieldError message={regErrors.acceptTerms?.message} />
                  </div>

                  <Button data-testid="button-register" type="submit" className="w-full rounded-full" disabled={register.isPending}>
                    {register.isPending ? tr(T.auth.registering) : tr(T.auth.registerBtn)}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
