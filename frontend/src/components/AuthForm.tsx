import type { ReactNode, SubmitEventHandler } from 'react'

type AuthFormProps = {
    title: string
    description: string
    submitLabel: string
    loadingLabel: string
    error: string
    isLoading: boolean
    onSubmit: SubmitEventHandler<HTMLFormElement>
    children: ReactNode
}

function AuthForm({
    title,
    description,
    submitLabel,
    loadingLabel,
    error,
    isLoading,
    onSubmit,
    children
}: AuthFormProps) {
    return (
        <main className="auth-page">
            <form className="auth-form" onSubmit={onSubmit}>
                <h1>{title}</h1>
                <p>{description}</p>

                {children}

                {error && <p className="auth-error">{error}</p>}

                <button type="submit" disabled={isLoading}>
                    {isLoading ? loadingLabel : submitLabel}
                </button>
            </form>
        </main>
    )
}

export default AuthForm