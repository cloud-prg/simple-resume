import Resume from "@/components/Resume";
import { MOCK_RESUME, MOCK_RESUME_LIST } from "@/mock";
import React, { useRef } from "react";
import EditResumeModal from "./components/EditResumeModal";
import { Button } from 'antd'
import GithubCorner from "@/components/GithubCorner";
import { GITHUB_IO_URL, GITHUB_URL, isDev } from "@/constant";

const Index = () => {
    const printRef = useRef<HTMLDivElement>(null);
    const [resume, setResume] = React.useState(MOCK_RESUME);
    const [activeIndex, setActiveIndex] = React.useState(0);

    const handlePrint = async () => {
        const printContent = printRef.current;

        if (!printContent) return;

        const printWindow = window.open('', '', 'width=800,height=600') as any;
        const doc = printWindow.document;

        const jitHref = isDev ? "/tailwind-jit.css" : `${GITHUB_IO_URL}/tailwind-jit.css`;

        doc.write('<html><head><title>Print</title>');
        // 需要在构建中
        doc.write(`<link href=${jitHref} rel="stylesheet">`); // JIT模式 
        doc.write('</head><body>');
        doc.write(printContent.innerHTML);
        doc.write('</body></html>');
        doc.close();

        // 监听样式加载完成后再执行打印
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
    };


    return <div className="h-screen w-full flex">
        {/* sidebar */}
        <div className="flex flex-col gap-[24px] px-[12px] py-[8px] h-full w-[200px] border">
            {/* controller region */}
            <div className="flex flex-col">
                <span className="text-3xl font-bold mb-[12px]">编辑区</span>
                <div className="flex flex-col gap-[10px]">
                    <EditResumeModal data={resume} onChange={setResume} >编辑简历</EditResumeModal>
                    <Button onClick={handlePrint} type="primary">打印简历</Button>
                </div>
            </div>
            {/* template region */}
            <div className="flex flex-col">
                <span className="text-3xl font-bold mb-[12px]">参考模板</span>
                <div className="flex flex-col gap-[10px]">
                    {MOCK_RESUME_LIST.map((item, index) => {
                        return <div className={`${activeIndex === index? "bg-blue-white" : ""} flex items-center gap-[10px] hover:bg-gray-200 cursor-pointer border border-gray-300 rounded-[4px] px-[8px] py-[4px]`} key={index} onClick={() => {
                            setActiveIndex(index);
                            setResume(item);
                        }}>
                            <span className="">{`模板 ${index + 1}`}</span>
                            {activeIndex === index && <span className="text-xs text-primary-2">当前选择</span>}
                        </div>
                    })}
                </div>
            </div>
        </div>
        {/* content */}
        <div className="flex-1 flex flex-col px-[36px] py-[8px]">
            <div className="flex items-center justify-between">
                <span className="text-3xl font-bold mb-[12px]">效果预览</span>
                <GithubCorner href={GITHUB_URL} />
            </div>
            <div ref={printRef} className="h-full w-full overflow-scroll">
                <Resume
                    {...resume}
                />
            </div>
        </div>

    </div>
}

export default Index;