

export type User = {
	userId: string;
	username: string;
};

export async function getUsers(): Promise<User[]> {
    const response = await fetch('/api/users')

    if (!response.ok) {
        throw new Error('Could not retrieve users')
    }

    return response.json()
}