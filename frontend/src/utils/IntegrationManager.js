export class IntegrationManager {
    static getAllIntegrations() {
        try {
            const allIntegrationsJson = localStorage.getItem("allIntegrations");
            if (allIntegrationsJson) {
                return JSON.parse(allIntegrationsJson);
            }
            
            const integrationParamsJson = localStorage.getItem("integrationParams");
            if (integrationParamsJson) {
                const params = JSON.parse(integrationParamsJson);
                if (params.type && params.credentials) {
                    const result = {};
                    result[params.type.toLowerCase()] = params;
                    return result;
                }
            }
            
            return {};
        } catch (e) {
            console.error("Error getting all integrations:", e);
            return {};
        }
    }
    
    static getIntegrationCredentials(type) {
        if (!type) return null;
        
        const allIntegrations = this.getAllIntegrations();
        
        if (allIntegrations[type]) {
            return allIntegrations[type].credentials;
        }
        
        const normalizedType = type.toLowerCase();
        for (const [key, value] of Object.entries(allIntegrations)) {
            if (key.toLowerCase() === normalizedType) {
                return value.credentials;
            }
        }
        
        try {
            const integrationParamsJson = localStorage.getItem("integrationParams");
            if (integrationParamsJson) {
                const params = JSON.parse(integrationParamsJson);
                if (params.type && params.type.toLowerCase() === normalizedType && params.credentials) {
                    return params.credentials;
                }
            }
        } catch (e) {
            console.error("Error getting single integration:", e);
        }
        
        return null;
    }
    
    static saveIntegration(type, credentials) {
        if (!type || !credentials) return false;
        
        try {
            const normalizedType = type.toLowerCase();
            const allIntegrations = this.getAllIntegrations();
            
            allIntegrations[normalizedType] = {
                type: type,
                credentials: credentials
            };
            
            localStorage.setItem("allIntegrations", JSON.stringify(allIntegrations));
            
            const currentIntegration = {
                type: type,
                credentials: credentials
            };
            localStorage.setItem("integrationParams", JSON.stringify(currentIntegration));
            
            return true;
        } catch (e) {
            console.error("Error saving integration:", e);
            return false;
        }
    }
    
    static removeIntegration(type) {
        if (!type) return false;
        
        try {
            const normalizedType = type.toLowerCase();
            const allIntegrations = this.getAllIntegrations();
            
            delete allIntegrations[normalizedType];
            
            if (Object.keys(allIntegrations).length > 0) {
                localStorage.setItem("allIntegrations", JSON.stringify(allIntegrations));
            } else {
                localStorage.removeItem("allIntegrations");
            }
            
            try {
                const currentIntegrationJson = localStorage.getItem("integrationParams");
                if (currentIntegrationJson) {
                    const currentIntegration = JSON.parse(currentIntegrationJson);
                    if (currentIntegration.type.toLowerCase() === normalizedType) {
                        localStorage.removeItem("integrationParams");
                    }
                }
            } catch (e) {
                console.error("Error checking current integration:", e);
            }
            
            return true;
        } catch (e) {
            console.error("Error removing integration:", e);
            return false;
        }
    }
    
    static isIntegrationConnected(type) {
        if (!type) return false;
        
        try {
            const allIntegrationsJson = localStorage.getItem("allIntegrations");
            if (allIntegrationsJson) {
                const allIntegrations = JSON.parse(allIntegrationsJson);
                
                if (allIntegrations[type] && allIntegrations[type].credentials) {
                    return true;
                }
                
                const normalizedType = type.toLowerCase();
                for (const [key, value] of Object.entries(allIntegrations)) {
                    if (key.toLowerCase() === normalizedType && value.credentials) {
                        return true;
                    }
                }
            }
            
            const integrationParamsJson = localStorage.getItem("integrationParams");
            if (integrationParamsJson) {
                const params = JSON.parse(integrationParamsJson);
                if (params.type === type && params.credentials) {
                    return true;
                }
                if (params.type && params.type.toLowerCase() === type.toLowerCase() && params.credentials) {
                    return true;
                }
            }
            
            return false;
        } catch (e) {
            console.error("Error in isIntegrationConnected:", e);
            return false;
        }
    }

    static updateIntegration(type, credentials, setCurrent = true) {
        if (!type || !credentials) return false;
        
        try {
            this.saveIntegration(type, credentials);
            
            if (setCurrent) {
                const currentIntegration = {
                    type: type,
                    credentials: credentials
                };
                localStorage.setItem("integrationParams", JSON.stringify(currentIntegration));
            }
            
            return true;
        } catch (e) {
            console.error("Error updating integration:", e);
            return false;
        }
    }

    static hasMatchingCredentials(type, credentials) {
        if (!type || !credentials) return false;
        
        try {
            const normalizedType = type.toLowerCase();
            const allIntegrations = this.getAllIntegrations();
            
            if (allIntegrations[normalizedType]) {
                const existingCreds = allIntegrations[normalizedType].credentials;
                return this.areCredentialsEqual(existingCreds, credentials);
            }
            
            return false;
        } catch (e) {
            console.error("Error checking credentials:", e);
            return false;
        }
    }
    
    static areCredentialsEqual(creds1, creds2) {
        if (!creds1 || !creds2) return false;
        
        let obj1 = creds1;
        let obj2 = creds2;
        
        if (typeof creds1 === 'string') {
            try {
                obj1 = JSON.parse(creds1);
            } catch (e) {
                return false;
            }
        }
        
        if (typeof creds2 === 'string') {
            try {
                obj2 = JSON.parse(creds2);
            } catch (e) {
                return false;
            }
        }
        
        const keysToCompare = ['access_token', 'token', 'refresh_token', 'id'];
        
        for (const key of keysToCompare) {
            if (obj1[key] !== obj2[key] && (obj1[key] || obj2[key])) {
                return false;
            }
        }
        
        return true;
    }
}
