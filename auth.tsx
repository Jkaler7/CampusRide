import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { BusFront, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { insertUserSchema } from "@shared/schema";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, user } = useAuth();
  const [, setLocation] = useLocation();

  if (user) {
    setLocation("/dashboard");
    return null;
  }

  const LoginForm = () => {
    const form = useForm<z.infer<typeof loginSchema>>({
      resolver: zodResolver(loginSchema),
    });

    return (
      <form onSubmit={form.handleSubmit((data) => login.mutate(data))} className="space-y-4 animate-slide-up">
        <div className="space-y-2">
          <label className="text-sm font-medium">Roll Number / Username</label>
          <Input 
            {...form.register("username")} 
            placeholder="e.g. 21CSE001" 
            className="h-12 rounded-xl"
          />
          {form.formState.errors.username && (
            <p className="text-xs text-red-500">{form.formState.errors.username.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <Input 
            type="password" 
            {...form.register("password")} 
            className="h-12 rounded-xl"
          />
          {form.formState.errors.password && (
            <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
          )}
        </div>
        
        {login.error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
            {login.error.message}
          </div>
        )}

        <Button 
          type="submit" 
          disabled={login.isPending}
          className="w-full h-12 rounded-xl text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
        >
          {login.isPending ? "Signing in..." : "Sign In"} <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>
    );
  };

  const RegisterForm = () => {
    const form = useForm<z.infer<typeof insertUserSchema>>({
      resolver: zodResolver(insertUserSchema),
      defaultValues: {
        role: "student"
      }
    });

    return (
      <form onSubmit={form.handleSubmit((data) => register.mutate(data))} className="space-y-4 animate-slide-up">
        <div className="space-y-2">
          <label className="text-sm font-medium">Full Name</label>
          <Input {...form.register("fullName")} className="h-12 rounded-xl" placeholder="John Doe" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Roll Number / Username</label>
          <Input {...form.register("username")} className="h-12 rounded-xl" placeholder="e.g. 21CSE001" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <Input type="password" {...form.register("password")} className="h-12 rounded-xl" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Role</label>
          <select 
            {...form.register("role")}
            className="w-full h-12 px-3 rounded-xl border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="student">Student</option>
            <option value="driver">Driver</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {register.error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
            {register.error.message}
          </div>
        )}

        <Button 
          type="submit" 
          disabled={register.isPending}
          className="w-full h-12 rounded-xl text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
        >
          {register.isPending ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-slide-up">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/30 rotate-3">
            <BusFront className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white tracking-tight">CampusRide</h1>
          <p className="text-muted-foreground mt-2">Smart transport for smart students.</p>
        </div>

        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-3xl p-8 shadow-2xl animate-slide-up delay-100">
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isLogin ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isLogin ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Register
            </button>
          </div>

          {isLogin ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  );
}
