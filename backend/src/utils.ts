export function getPort(): number {
    const maybe = process.env.PORT || "3008";

    const port = Number(maybe);

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error("Invalid PORT environment variable");
    }

    return port;
}