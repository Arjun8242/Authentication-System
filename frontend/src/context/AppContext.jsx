import { createContext, useContext,
    useEffect, useState} from "react";
import { server } from "../main";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);
    
    async function fetchUser() {
        setLoading(true);
        try {
            const { data } = await api.get(`${server}/api/v1/me`, {
                withCredentials: true,
            });

            setUser(data.user);
            setIsAuth(true);
        } catch (error) {
            console.log(error);
            setUser(null);
            setIsAuth(false);
        }
        finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUser()
    }, [])

    return (
        <AppContext.Provider value = {{ setIsAuth, isAuth, user, setUser, loading}}>
            {children}
        </AppContext.Provider>
    )
}

export const AppData = () => {
    const context = useContext(AppContext);

    if(!context) throw new Error("AppData must be used within an Appprovider");
    return context;
};