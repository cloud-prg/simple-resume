import Resume from "@/components/Resume";
import { MOCK_RESUME } from "@/mock";



const Index = () => {
    return <div className="h-full w-fullborder border-[4px] border-blue-500 p-4">
        Resume Page
        <Resume
            {...MOCK_RESUME}
        />
    </div>
}

export default Index;