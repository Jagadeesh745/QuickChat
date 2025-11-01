import { createContext, useContext, useState, useEffect} from "react";
import { AuthContext } from "./AuthContext";

export const ChatContext = createContext();

export const ChatProvider = ({children})=>{
    const [messages,setmessages] = useState([]);
    const [users,setusers] = useState([]);
    const [selecteduser,setselecteduser] = useState(null);
    const [unseenMessages,setunseenMessages] = useState({});
    
    const {socket,axios} = useContext(AuthContext);

    const getusers = async()=>{
        try {
            const {data} = await axios.get("/api/messages/users");
            if(data.success){
                setusers(data.users);
                setunseenMessages(data.unseenMessages);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }
    
    const getMessages = async(userId)=>{
        try {
            const {data} = await axios.get(`/api/messages/${userId}`);
            if(data.success){
                setmessages(data.messages);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const sendmessage = async(messagedata)=>{
        try {
            const {data} = await axios.post(`/api/messages/send/${selecteduser._id}`,messagedata);
            if(data.success){
                setmessages((prevMessages)=>[...prevMessages,data.newMessage]);
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }
    
    const subscribeToMessages = async()=>{
        if(!socket) return;

        socket.on("newMessage",(newMessage)=>{
            if(selecteduser && newMessage.senderId === selecteduser._id){
                newMessage.seen = true;
                setmessages((prevMessages)=>[...prevMessages,newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            }else{
                setunseenMessages((prevunseenMessages)=>({
                    ...prevunseenMessages, [newMessage.senderId] : prevunseenMessages[newMessage.senderId] ? 
                    prevunseenMessages[newMessage.senderId]+1 : 1
                }))
            }
        });
    }
    
    const unsubscribefromMessages = ()=>{
        if(socket) socket.off("newMessage");
    }

    useEffect(()=>{
        subscribeToMessages();
        return ()=> unsubscribefromMessages();
    },[socket,selecteduser])

    const value = {
        messages, users, selecteduser, getusers, getMessages, sendmessage, 
        setselecteduser, unseenMessages, setunseenMessages
    }
    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}