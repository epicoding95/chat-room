import React, { useState, useEffect } from 'react';
import classes from './MessagesContainer.module.css';
import InputArea from './InputArea/InputArea';
import FormInfoDisplay from './FormInfoDisplay/FormInfoDisplay';
import firebase from 'firebase/app';
import io from "socket.io-client";
const MessagesContainer = (props) => {

    const { getUsers } = props;
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [firebaseUser, setFirebaseUser] = useState('');



    const socket = io("/", {
        transports: ["websocket", "polling"]
    });
    const handleSubmit = (e, message) => {
        e.preventDefault();
        socket.emit("send", message, firebaseUser);
        setMessage("");
    }

    useEffect(() => {
        firebase.auth().onAuthStateChanged((user) => {
            const holder = user.displayName
            setFirebaseUser(holder)

        });
    }, [])

    useEffect(() => {

        socket.on("connect", () => {
            socket.emit("username", firebaseUser);
        });
        socket.on("message", (message) => {
            setMessages(messages => [...messages, message]);
            props.getUsers(message.user)
        });

        socket.on("disconnected", id => {
            setUsers(users => {
                return users.filter(user => user.id !== id);
            });
        });
    }, []);
    return (
        <div className={classes.MessagesContainer}>
            <FormInfoDisplay messagesToDisplay={messages}
                firebaseUser={firebaseUser}
                serverUsers={messages}
            />
            <div className={classes.InputArea}> <InputArea handleSubmit={handleSubmit} /></div>

        </div>
    );
};

export default MessagesContainer;