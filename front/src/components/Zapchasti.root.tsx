import { zapchasti } from "../config/constants"

export default function ZapchastiRoot() {
    return (
        <>
            <h1>Выберите запчасть</h1>

            <div>
                <p>блок сортировки</p>
            </div>
            <div id="zapchasti-root">
                {zapchasti.map((item,index) => {
                    return (
                        <div className="zapchasti-item" key={index}>
                            <img src={item.image} alt={item.name} />
                        </div>
                    )
                })}
            </div>
        </>
    )
}