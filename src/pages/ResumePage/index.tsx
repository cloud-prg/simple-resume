import Resume from "@/components/Resume";
import { MOCK_RESUME, MOCK_RESUME_LIST } from "@/mock";
import React, { useMemo, useRef } from "react";
import EditResumeModal from "./components/EditResumeModal";
import { Button } from 'antd'
import GithubCorner from "@/components/GithubCorner";
import { GITHUB_IO_URL, GITHUB_URL, isDev } from "@/constant";
import { ResumeProps } from "@/types";

const Index = () => {
    const printRef = useRef<HTMLDivElement>(null);
    const localResumeList = JSON.parse(localStorage?.getItem?.('resumeList') || '');
    const [resumeList, setResumeList] = React.useState<ResumeProps[]>(localResumeList || MOCK_RESUME_LIST);
    const [activeIndex, setActiveIndex] = React.useState(0);

    const resume = useMemo(() => {
        return resumeList[activeIndex]
    }, [activeIndex, resumeList])

    React.useEffect(() => {
        localStorage.setItem("resumeList", JSON.stringify(resumeList));
    }, [resumeList])

    const handlePrint = async () => {
        const printContent = printRef.current;

        if (!printContent) return;

        const printWindow = window.open('', '', 'width=1200,height=900') as any;
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


    const handleChange = (data: ResumeProps) => {
        setResumeList(prev => {
            return prev.map((item, index) => {
                if (index === activeIndex) {
                    return data;
                }
                return item;
            })
        })
    }

    return <div className="h-screen w-full flex">
        {/* sidebar */}
        <div className="flex flex-col gap-[24px] px-[12px] py-[8px] h-full w-[240px] border">
            {/* controller region */}
            <div className="flex flex-col gap-[12px]">
                <span className="text-3xl font-bold">编辑区</span>
                <span className="text-xs text-gray-400">⚠️:若点击打印简历无反应,请检查浏览器拦截或换用chrome</span>
                <div className="flex flex-col gap-[10px]">
                    <EditResumeModal data={resume} onChange={handleChange} >编辑简历</EditResumeModal>
                    <Button onClick={handlePrint} type="primary">打印简历</Button>
                </div>
            </div>
            {/* template region */}
            <div className="flex flex-col gap-[12px]">
                <span className="text-3xl font-bold">历史记录</span>
                <div className="flex flex-col gap-[10px]">
                    {resumeList.map((item, index) => {
                        return <div className={`${activeIndex === index ? "bg-blue-white" : ""} flex items-center justify-between hover:bg-gray-200 cursor-pointer border border-gray-300 rounded-[4px] px-[8px] py-[4px]`} key={index} onClick={() => {
                            setActiveIndex(index);
                            // setResume(item);
                        }}>
                            <span className="">{item.name}</span>
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