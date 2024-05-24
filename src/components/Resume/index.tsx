import { ContactType, EducationType, ExperienceType } from '@/types';
import React from 'react';
import CareerSvg from '@/assets/career.svg'
import EmailSvg from '@/assets/email.svg'
import PhoneSvg from '@/assets/phone.svg'

interface IProps {
    contact: ContactType;
    education: EducationType;
    experience: ExperienceType[];
}

const Index: React.FC<IProps> = (props) => {
    // const { contact, education, experience } = props;
    const { name, email, phone, career } = props.contact;

    return <div className="text-[24px] border border-gray-300 rounded-md">
        <h1>{name}</h1>
        <div>
            <p className='flex items-center'><img src={CareerSvg} alt="email" />:{email}</p>
            <p><img src={PhoneSvg} alt="phone" />: {phone}</p>
            <p><img src={CareerSvg} alt="career" />: {career}</p>
        </div>
    </div>
}

export default Index;