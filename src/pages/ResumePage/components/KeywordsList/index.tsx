import React from "react";
import { Select } from 'antd'

const Index = ({ value, onChange: onWidgetChange }: any) => {
    return <Select mode='tags' value={value} onChange={onWidgetChange} />
}

export default Index;