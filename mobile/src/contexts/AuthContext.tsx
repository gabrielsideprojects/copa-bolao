import { createContext, ReactNode, useState, useEffect } from "react";
import * as Google from 'expo-auth-session/providers/google'
import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import { api} from '../services/api'

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
        clientId: process.env.CLIENT_ID,
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
       try {
        setUserIsLoading(true);

        const tokenResponse = await api.post('/users', {
            access_token
        });
        api.defaults.headers.common['Authorization'] = `Bearer ${tokenResponse.data.token}`
        
        const userInfoResponse = await api.get('/me');
        setUser(userInfoResponse.data.user)

       } catch (error) {
            console.log(error);
            throw error;
       } finally {
            setUserIsLoading(false)
       }
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