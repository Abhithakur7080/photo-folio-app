import { useEffect, useState } from "react";
import styles from './ImageList.module.css';
import { db } from "../../firebaseinit";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
    collection,
    addDoc,
    doc,
    setDoc,
    onSnapshot,
    deleteDoc,
}
    from 'firebase/firestore'
const ImageList = ({ albumId, onBackClick }) => {
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [images, setImages] = useState([]);
    const [editImageId, setEditImageId] = useState(null);

    const handleToggleForm = () => {
        setShowForm(!showForm)
        setEditImageId(null);
    }

    const handleAddImage = async () => {
        try {
            if (editImageId) {
                await setDoc(doc(db, 'images', editImageId), {
                    albumId,
                    title,
                    imageUrl,
                });
                toast.success("Images Updated Successfully");
            }
            else {
                await addDoc(collection(db, 'images'), {
                    albumId,
                    title,
                    imageUrl
                });
                toast.success("Images added Successfully");
            }
            handleClearInput();
        }
        catch (error) {
            console.error("Error in adding/updating images to database: ", error);
        }
    };

    const handleClearInput = () => {
        setTitle('');
        setImageUrl('');
        setEditImageId('')
    }

    const handleDeleteImage = async (imageId) => {
        try {
            await deleteDoc(doc(db, "images", imageId));
            toast.success("Images Deleted Successfully");
        }
        catch (error) {
            console.error("Error in deleting images from database: ", error);
        }
    }

    const handleEditImage = (image) => {
        setTitle(image.title);
        setImageUrl(image.url);
        setEditImageId(image.id);
        setShowForm(true);
    }

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'images'), (queruSnapshot) => {
            const imageData = queruSnapshot.docs.filter((doc) =>
                doc.data()
                    .albumId === albumId)
                .map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));
            setImages(imageData)
        })
        return () => {
            unsubscribe();
        }
    }, [albumId]);

    return (
        <>
            <div className={styles.main}>
                {showForm && (
                    <div className={styles.form}>
                        <h1>{editImageId ? "Edit Image" : "Add Image"}</h1>
                        <input
                            type="text"
                            placeholder="Title"
                            className="title"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            autoFocus
                        />
                        <input
                            type="text"
                            placeholder="Image Url"
                            className="imageUrl"
                            required
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            autoFocus
                        />
                        <div className="imagelist-btn">
                            <button
                                className="clear"
                                onClick={handleClearInput}>
                                Clear
                            </button>
                            <button
                                className="add"
                                onClick={handleAddImage}>
                                {editImageId ? "Update" : "Add"}
                            </button>
                        </div>
                    </div>
                )}
                <div className={styles.top}>
                    <img
                        src="https://cdn-icons-png.flaticon.com/128/2099/2099238.png"
                        alt="back.png"
                        className="back"
                        onClick={onBackClick}
                    />
                    <h1>
                        {images.length === 0 ? "No Images in Album" : "Images in Album"}
                    </h1>
                    <button
                        className="add"
                        onClick={handleToggleForm}>
                        {showForm ? "cancel" : "Add Image"}
                    </button>
                </div>
                <div className={styles.images}>
                    {images.map((image) => (
                            <div
                            className={styles.imageCont}
                                key={image.id}>
                                <div>
                                    <img
                                        src="https://cdn-icons-png.flaticon.com/128/1828/1828911.png"
                                        alt="edit.png"
                                        className={styles.edit}
                                        onClick={() => handleEditImage(image)}
                                    />
                                    <img
                                        src="https://cdn-icons-png.flaticon.com/128/1214/1214428.png"
                                        alt="delete.png"
                                        className={styles.delete}
                                        onClick={() => handleDeleteImage(image.id)}
                                    />
                                </div>
                                <img src={image.imageUrl} alt="" className={styles.mainImage} />
                                <h1>{image.title}</h1>
                            </div>
                    ))}
                </div>
            </div>
            <ToastContainer />
        </>
    )
}

export default ImageList;