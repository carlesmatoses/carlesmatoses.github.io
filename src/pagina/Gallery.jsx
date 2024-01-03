import React from "react";

const Gallery = () => {
    const images = [
        "https://instagram.fvlc1-2.fna.fbcdn.net/v/t51.2885-15/415956022_843476987468694_7239770893766541575_n.jpg?stp=dst-jpg_e35&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xNDQweDE4MDAuc2RyIn0&_nc_ht=instagram.fvlc1-2.fna.fbcdn.net&_nc_cat=106&_nc_ohc=lrtUCGPakWoAX9FafVZ&edm=ACWDqb8BAAAA&ccb=7-5&ig_cache_key=MzI3MTQ4NTc5NzkyNjg2NjYzOQ%3D%3D.2-ccb7-5&oh=00_AfD1EeWBuXskQgPT95SJ7pf-9WTgbBKq9OykcP-QgVCI1w&oe=65997F42&_nc_sid=ee9879",
        "https://instagram.fvlc1-2.fna.fbcdn.net/v/t51.2885-15/414731105_895821335182626_3640978757566958829_n.jpg?stp=dst-jpg_e35&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xNDQweDEwODAuc2RyIn0&_nc_ht=instagram.fvlc1-2.fna.fbcdn.net&_nc_cat=106&_nc_ohc=kmGf17b1ikIAX9KKxi2&edm=ACWDqb8BAAAA&ccb=7-5&ig_cache_key=MzI3MTQ3MTA2OTE1MDIyMTMzNg%3D%3D.2-ccb7-5&oh=00_AfB5fnSLVp7jsH38v8Vy_4sNfuSEkCxXC1EKR2zZS09c6Q&oe=659893C8&_nc_sid=ee9879",
        "https://media.istockphoto.com/id/1146517111/photo/taj-mahal-mausoleum-in-agra.jpg?s=612x612&w=0&k=20&c=vcIjhwUrNyjoKbGbAQ5sOcEzDUgOfCsm9ySmJ8gNeRk=",
    ];

    return (
        <div>
            {images.map((url, index) => (
                <img key={index} src={url} alt="" />
            ))}
        </div>
    );
};

export default Gallery;