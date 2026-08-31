import { useState } from "react";
import MarksRoot from "../components/Marks.root";
import ModelsRoot from "../components/Models.root";
import ZapchastiRoot from "../components/Zapchasti.root";


export default function Home() {

    const [changeIndexMark, setChangeIndexMark] = useState(0);

   function handleChageMark (index : number, name : string) : void {
        setChangeIndexMark(index);
        console.log(name);
        // Потом отправляем марку на бэк
    }
  return (
    <div>
        {/* Header */}
        <header id='header' >
            <p>Home Page</p>
        </header>

        {/* Main */}
        <main>
            <p>Main Page</p>

            <MarksRoot changeIndexMark={changeIndexMark} handleChageMark={handleChageMark} />

            <ModelsRoot />

            <ZapchastiRoot />

        </main>

        {/* Footer */}
        <footer>
            <p>Footer Page</p>
        </footer>
    </div>
  )
}