import {MainKeno} from "./component/MainKeno";
import "./App.css"
import {useEffect, useState} from "react";
import KenoPoster from "./assets/keno_loader.png"

function App() {
    const [progressKeno, setProgressKeno] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const kenoImageModules = import.meta.glob('./assets/*.{png, jpg, jpeg, webp, svg}', {
            eager: true,
            import: "default",
        });

        const assetsKeno = Object.values(kenoImageModules) as string[];
        let count = 0;

        const loadImgKeno = (src: string) => {
            return new Promise<void>((resolve) => {
                const imgKeno = new Image();
                imgKeno.src = src;
                imgKeno.onload = imgKeno.onerror = () => {
                    count++;
                    setProgressKeno((count / assetsKeno.length) * 100);
                    resolve();
                };
            });
        };

        Promise.all(assetsKeno.map(loadImgKeno)).then(() => {
            setTimeout(() => {
                setIsLoading(false);
            }, 3000);
        })
    }, []);

    return (
        <div>
            {isLoading ? (
                <div className="keno-container">
                    <div className="keno-loader-container">
                        <img src={KenoPoster} alt="Keno Poster" className="keno-poster"/>
                        <div className="keno-loader">
                            <div className="keno-loader-bar">
                                <div className="loader-bar" style={{width:`${progressKeno}%`}}></div>
                            </div>
                            <p>Preparing Your Game ... {Math.round(progressKeno)}%</p>
                        </div>
                    </div>
                </div>
            ) : (
                <MainKeno/>
            )}
        </div>
    );
}

export default App;
