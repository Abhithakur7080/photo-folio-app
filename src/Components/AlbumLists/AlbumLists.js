import { useState, useEffect } from "react";
import styles from './AlbumLists.module.css';
import AlbumForm from "../AlbumForm/AlbumForm";
import { db } from "../../firebaseinit";
import ImageList from "../ImageList/ImageList";
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc
} 
from "firebase/firestore";

const AlbumLists = () => {
    const [showForm, setShowForm] = useState(false);
    const [albumName, setAlbumName] = useState('');
    const [albums, setAlbums] = useState([]);
    const [selectedAlbumId, setSelectedAlbumId] = useState(null);

    const fetchAlbums = async () => {
        const querySnapshot = await getDocs(collection(db, 'albums'))
        const albumData = [];
        querySnapshot.forEach((doc) => {
            albumData.push({id: doc.id, name: doc.data().name});
        });
        setAlbums(albumData);
    }
    useEffect(() => {
        fetchAlbums();
    }, []);

    const handleAddedAlbum = () => {
        setShowForm((previousForm) => !previousForm);
    }

    const handleAlbumCreate = async (name) => {
        try{
            console.log(name);
            const docRef = await addDoc(collection(db, 'albums'), {
                name: name,
            });
            setAlbumName(name);
            fetchAlbums();
        }
        catch(error){
            console.log("Error in creating ALbums: ", error);
        }
    }

    const handleAlbumClick = (albumId) =>{
        setSelectedAlbumId(albumId);
        setShowForm(false);
    }

    const handleBackClick = () => {
        setSelectedAlbumId(null);
    }

    const handleAlbumRemove = async (id) => {
        const docRef = doc(db, 'albums', id);
        await deleteDoc(docRef);

    }

    return(
         <>
         {showForm && <AlbumForm onAlbumCreate={handleAlbumCreate}/>}
         {!selectedAlbumId && (
            <div className={styles.main}>
                <h2>Your albums</h2>
                <button onClick={handleAddedAlbum}>{showForm?'Cancel':'Add Album'}
                </button>
            </div>
         )}
         {!selectedAlbumId && albums.length>0 && (
            <div className={styles.lists}>
                {
                    albums.map((album) => (
                        <div
                        key={album.id}
                        >
                            <img
                                src="https://cdn-icons-png.flaticon.com/128/1214/1214428.png"
                                alt="delete"
                                className={styles.delete}
                                onClick={() => handleAlbumRemove(album.id)}
                            />
                            <img src="https://cdn-icons-png.flaticon.com/128/2659/2659360.png" alt="album"
                            className={styles.icon}
                            onClick={() => handleAlbumClick(album.id)}/>
                            <span>{album.name}</span>
                        </div>
                    ))
                }
            </div>
         )}
         {selectedAlbumId && (
            <ImageList 
            albumId={selectedAlbumId}
            onBackClick={handleBackClick}
            />
         )}
         </>
    )
}

export default AlbumLists;