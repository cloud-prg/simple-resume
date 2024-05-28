import { ContactType, EducationType, ExperienceType } from '@/types';
import React from 'react';
import CareerSvg from '@/assets/career.svg'
import EmailSvg from '@/assets/email.svg'
import PhoneSvg from '@/assets/phone.svg'
import LocationSvg from '@/assets/location.svg'
interface IProps {
    contact: ContactType;
    education: EducationType;
    experience: ExperienceType[];
    ref?: React.RefObject<any>;
}

const Index: React.FC<IProps> = (props) => {
    // const { contact, education, experience } = props;
    const { name, email, phone, career, location } = props.contact;
    const { degree, major, school, startDate, endDate } = props.education;

    const ContactItem = ({ icon, text }: { icon: string, text?: string }) => {
        if (!text) return null

        return <div className='text-lg flex items-center gap-[4px] text-grey-1'>
            <img className='w-[20px]' src={icon} alt={text} />
            <span>{text}</span>
        </div>
    }

    /**
     * UI 规范：
     * - 文字大小：名字5xl 大标题3xl 标题2xl 标题xl 
     * - 间距：大模块24px 小模块12px 子标题与子内容6px
    */
    return <div className="flex flex-col w-full  gap-[24px] text-2xl text-grey-1 rounded-md">
        {/* Contact */}
        <div className='flex flex-col'>
            <span className='text-5xl mb-[12px] font-bold'>{name}</span>
            <div className='flex items-center gap-[24px]'>
                <ContactItem icon={PhoneSvg} text={phone} />
                <ContactItem icon={EmailSvg} text={email} />
                <ContactItem icon={CareerSvg} text={career} />
                <ContactItem icon={LocationSvg} text={location} />
            </div>
        </div>

        {/* Education */}
        <div className='flex flex-col'>
            <span className='text-3xl font-bold mb-[12px]'>教育经历</span>
            <div className='text-2xl w-full flex items-center justify-between'>
                <span className='font-bold'>{`${school} ${degree}`}</span>
                <span >{`${startDate} - ${endDate}`}</span>
            </div>
            <span className='text-base'>{major}</span>
        </div>

        {/* Experience */}
        <div className='flex flex-col'>
            <span className='text-3xl font-bold mb-[12px]'>工作经历</span>
            {props.experience.map((item) => {
                const { company, project, career, startDate, endDate, keywords, workContent, summary } = item;
                return <div key={company} className='flex flex-col mb-[24px]'>
                    {/* Title */}
                    <div className='text-2xl flex justify-between items-center'>
                        <div className='flex items-center gap-[8px] font-bold text-grey-2'>
                            <span>{company}</span>
                            <span>{project}</span>
                            <span>{career}</span>
                        </div>
                        <div>{`${startDate}-${endDate}`}</div>
                    </div>
                    {/* Keywords */}
                    <div className='text-2xl text-lg flex items-center gap-[4px] mb-[12px]'>
                        <span className='font-bold text-grey-2'>技术栈:</span>
                        <div className='flex item-center gap-[4px]'>
                            <span className='text-base text-grey-2'>{keywords?.join(' , ')}</span>
                        </div>
                    </div>
                    {/* Content */}
                    {
                        workContent && workContent.length > 0 && <div className='flex flex-col mb-[12px]'>
                            <span className='text-xl font-bold text-grey-2 mb-[6px]'>工作内容:</span>
                            <ul className='list-disc list-inside flex flex-col gap-[4px]'>
                                {workContent?.map((item, index) => {
                                    return <li key={index} className='text-base text-grey-2'>{item.value}</li>
                                })}
                            </ul>
                        </div>
                    }
                    {/* Summary */}
                    {
                        summary && summary.length > 0 && <div className='flex flex-col'>
                            <span className='text-xl font-bold text-grey-2 mb-[6px]'>业绩:</span>
                            <ul className='list-disc list-inside'>
                                {summary?.map((item, index) => {
                                    return <li key={index} className='text-base text-grey-2'>{item.value}</li>
                                })}
                            </ul>
                        </div>
                    }
                </div>
            })}
        </div>
    </div>
}

export default Index;