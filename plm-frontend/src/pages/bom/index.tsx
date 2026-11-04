import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function BomManagement() {
  const navigate = useNavigate();
  return (
    <Result
      status="info"
      title="BOM 管理"
      subTitle="对应 S3 阶段 - 物料与 BOM 管理（TASK-S3-01 至 TASK-S3-12）"
      extra={<Button type="primary" onClick={() => navigate('/dashboard')}>返回工作台</Button>}
    />
  );
}