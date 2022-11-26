import { createContext, ReactNode, useState, useEffect } from "react";
import * as Google from 'expo-auth-session/providers/google'
import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'

WebBrowser.maybeCompleteAuthSession();

interface UserProps {
    name: string;
    avatarUrl: string;
}

export interface AuthContextDataProps {
    user: UserProps;
    isUserLoading: boolean;
    signIn: () => Promise<void>;
}

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextDataProps);

export function AuthContextProvider({ children } : AuthProviderProps){
    const [isUserLoading, setUserIsLoading] = useState(false);
    const [user, setUser] = useState<UserProps>({} as UserProps);

   const [request, response, promptAsync] =  Google.useAuthRequest({
        clientId: '54246836638-8jbch98d9n8hle7f2ged74fh62qs1fb7.apps.googleusercontent.com',
        redirectUri: AuthSession.makeRedirectUri({useProxy: true}),
        scopes: ['profile', 'email']
    })

    console.log(AuthSession.makeRedirectUri({useProxy: true}))

    async function signIn(){
        try {
            setUserIsLoading(true)
            await promptAsync();
        } catch (error) {
            console.log('deu erro', error)
            throw error;
        } finally {
            setUserIsLoading(false)
        }
    }

    async function signInWithGoogle(access_token: string){
        console.log('TOKEN DE AUTENTICAÇÃO ====>', access_token)
    }

    useEffect(()=>{
        if(response?.type === 'success' && response.authentication?.accessToken) {
            signInWithGoogle(response.authentication.accessToken)
        }
    },[response])

    return (
        <AuthContext.Provider value={{
            signIn,
            isUserLoading,
            user
        }}
        >
            {children}
        </AuthContext.Provider>
    )
}