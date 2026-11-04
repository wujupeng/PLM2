import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function Manufacturing() {
  const navigate = useNavigate();
  return (
    <Result
      status="info"
      title="制造数据协同"
      subTitle="对应 S7-S10 阶段 - 制造协同与 ERP/MES/QMS 接口集成"
      extra={<Button type="primary" onClick={() => navigate('/dashboard')}>返回工作台</Button>}
    />
  );
}