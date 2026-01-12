import AuthForm from './auth-form'

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background gradients */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -z-10 animate-blob" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -z-10 animate-blob animation-delay-2000" />

            <div className="mb-8 text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 mb-4">
                    <span className="text-xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">C</span>
                </div>
                <h2 className="text-2xl font-semibold tracking-tight">Catery Manager</h2>
            </div>

            <AuthForm />
        </div>
    )
}
