'use client';

import { useState } from 'react';
import { useAuth } from '../../../hooks/use-auth';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '../../../components/ui/card';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import Link from 'next/link';
import { Loader2, LogIn } from 'lucide-react';

export default function LoginPage() {
    const { login, isLoading, error } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await login(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <Card className="w-full shadow-xl">
            <CardHeader className="space-y-1">
                <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                        <LogIn className="w-6 h-6 text-primary-foreground" />
                    </div>
                </div>
                <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
                <CardDescription className="text-center">
                    Sign in to your Omni-Learner account
                </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="username">Email Address</Label>
                        <Input
                            id="username"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <Link
                            href="/forgot-password"
                            className="text-primary hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4">
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            'Sign in'
                        )}
                    </Button>

                    <p className="text-sm text-center text-muted-foreground">
                        Don't have an account?{' '}
                        <Link
                            href="/register"
                            className="text-primary font-medium hover:underline"
                        >
                            Sign up
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}
