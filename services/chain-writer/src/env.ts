function required(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required env var: ${name}`);
    }
    return value;
}

export const env = {
    port: Number(process.env.PORT ?? 8090),
    internalApiKey: required("INTERNAL_API_KEY"),
    tonEndpoint: required("TON_ENDPOINT"),
    tonApiKey: process.env.TON_API_KEY ?? "",
    escrowAddress: required("ESCROW_ADDRESS"),
    oracleMnemonic: required("ORACLE_MNEMONIC").split(" "),
};
