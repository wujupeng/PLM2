import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function MaterialManagement() {
  const navigate = useNavigate();
  return (
    <Result
      status="info"
      title="物料管理"
      subTitle="对应 S2 阶段 - 产品数据模型建立（TASK-S2-01 至 TASK-S2-10）"
      extra={<Button type="primary" onClick={() => navigate('/dashboard')}>返回工作台</Button>}
    />
  );
}