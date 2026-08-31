import { models } from "../config/constants"

export default function ModelsRoot() {
    return (
        <>
            <h1>Выберите модель</h1>
            <div id="models-root">
                {models.map((item,index) => {
                    return (
                        <div className="models-item" key={index}>
                            <img src={item.image} alt={item.name} />
                        </div>
                    )
                })}
            </div>
        </>
    )
}