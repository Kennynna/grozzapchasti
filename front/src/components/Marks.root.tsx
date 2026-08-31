import { marks } from "../config/constants"


interface MarksRootProps {
    changeIndexMark: number
    handleChageMark: (index: number, name: string) => void
}

export default function MarksRoot ({ changeIndexMark, handleChageMark }: MarksRootProps) {
    return (
        <>

            {/* Marks */}
            <h1>Выберите марку</h1>
            <div  id="marks-root">
            {marks.map((item,index) => {
                return (
                    <div className={`marks-item ${changeIndexMark === index ? 'marks-active' : ''}`} key={index} onClick={() => handleChageMark(index, item.name)}>
                    <img src={item.image} alt={item.name} />
                    </div>
                )
            })}
            </div>
        </>
    )
}