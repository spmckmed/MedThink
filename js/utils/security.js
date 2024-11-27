// Utilitaires de sécurité pour la gestion des clés API
export class SecurityUtils {
    static encodeApiKey(apiKey) {
        return btoa(apiKey);
    }

    static decodeApiKey(encodedKey) {
        return atob(encodedKey);
    }

    static async loadEnvironmentVariables() {
        try {
            const response = await fetch('/.env');
            const text = await response.text();
            const vars = {};
            
            text.split('\n').forEach(line => {
                const [key, value] = line.split('=');
                if (key && value) {
                    vars[key.trim()] = value.trim();
                }
            });
            
            return vars;
        } catch (error) {
            console.error('Erreur lors du chargement des variables d\'environnement:', error);
            return {};
        }
    }

    static maskApiKey(apiKey) {
        if (!apiKey) return '';
        const visibleChars = 4;
        return `${apiKey.substr(0, visibleChars)}...${apiKey.substr(-visibleChars)}`;
    }
}
