'use client';

import { useAuth } from '../../hooks/use-auth';
import { Button } from '../../components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Trello,
    ListTodo,
    Timer,
    Wallet,
    BarChart3,
    LogOut,
    User,
} from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const navigation = [
        { name: 'Boards', href: '/boards', icon: Trello },
        { name: 'Cards', href: '/cards', icon: ListTodo },
        { name: 'Sprints', href: '/sprints', icon: Timer },
        { name: 'Wallet', href: '/wallet', icon: Wallet },
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link href="/boards" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <LayoutDashboard className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">
                                Omni-Learner
                            </span>
                        </Link>

                        {/* Navigation */}
                        <nav className="hidden md:flex space-x-1">
                            {navigation.map((item) => {
                                const isActive = pathname.startsWith(item.href);
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                            ? 'bg-primary text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* User Menu */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="hidden sm:block text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                        {user?.username}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        💰 ${user?.wallet_balance.toFixed(2)}
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={logout}
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
