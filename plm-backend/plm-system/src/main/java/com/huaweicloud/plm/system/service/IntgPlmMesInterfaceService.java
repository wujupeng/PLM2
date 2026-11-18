package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.IntgPlmMesInterfaceQuery;
import com.huaweicloud.plm.system.dto.IntgPlmMesInterfaceSaveRequest;
import com.huaweicloud.plm.system.entity.IntgPlmMesInterface;
import com.huaweicloud.plm.system.mapper.IntgPlmMesInterfaceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 集成接口定义服务：PLM→MES 集成接口配置的登记、分页查询与删除。
 * 接口编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class IntgPlmMesInterfaceService {

    private static final String DEFAULT_NO_PREFIX = "PMI";
    private static final String DEFAULT_DIRECTION = "PLM_TO_MES";
    private static final String DEFAULT_OBJECT_TYPE = "ROUTING";
    private static final String DEFAULT_PROTOCOL = "API";
    private static final String DEFAULT_TRIGGER_TYPE = "MANUAL";
    private static final String DEFAULT_SYNC_MODE = "INCREMENTAL";
    private static final String DEFAULT_STATUS = "DRAFT";

    private final IntgPlmMesInterfaceMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询集成接口定义：对象类型/协议/状态/方向精确，接口编号/名称/端点模糊，按主键倒序。 */
    public PageResult<IntgPlmMesInterface> page(IntgPlmMesInterfaceQuery query) {
        String keyword = query.getKeyword();
        Page<IntgPlmMesInterface> page = mapper.selectPage(query.toPage(), Wrappers.<IntgPlmMesInterface>lambdaQuery()
                .eq(StringUtils.hasText(query.getObjectType()), IntgPlmMesInterface::getObjectType, query.getObjectType())
                .eq(StringUtils.hasText(query.getProtocol()), IntgPlmMesInterface::getProtocol, query.getProtocol())
                .eq(StringUtils.hasText(query.getInterfaceStatus()), IntgPlmMesInterface::getInterfaceStatus, query.getInterfaceStatus())
                .eq(StringUtils.hasText(query.getDirection()), IntgPlmMesInterface::getDirection, query.getDirection())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(IntgPlmMesInterface::getInterfaceNo, keyword).or()
                        .like(IntgPlmMesInterface::getInterfaceName, keyword).or()
                        .like(IntgPlmMesInterface::getEndpoint, keyword))
                .orderByDesc(IntgPlmMesInterface::getId));
        return PageResult.of(page);
    }

    public IntgPlmMesInterface detail(Long id) {
        return require(id);
    }

    /** 新增或更新集成接口定义：新增时回填默认方向、对象类型、协议、触发方式、同步模式、状态与组织，编号为空时自动生成。 */
    public Long save(Long id, IntgPlmMesInterfaceSaveRequest request) {
        IntgPlmMesInterface entity;
        if (id == null) {
            entity = new IntgPlmMesInterface();
            entity.setInterfaceNo(StringUtils.hasText(request.getInterfaceNo())
                    ? request.getInterfaceNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setDirection(StringUtils.hasText(request.getDirection())
                    ? request.getDirection() : DEFAULT_DIRECTION);
            entity.setObjectType(StringUtils.hasText(request.getObjectType())
                    ? request.getObjectType() : DEFAULT_OBJECT_TYPE);
            entity.setProtocol(StringUtils.hasText(request.getProtocol())
                    ? request.getProtocol() : DEFAULT_PROTOCOL);
            entity.setTriggerType(StringUtils.hasText(request.getTriggerType())
                    ? request.getTriggerType() : DEFAULT_TRIGGER_TYPE);
            entity.setSyncMode(StringUtils.hasText(request.getSyncMode())
                    ? request.getSyncMode() : DEFAULT_SYNC_MODE);
            entity.setInterfaceStatus(StringUtils.hasText(request.getInterfaceStatus())
                    ? request.getInterfaceStatus() : DEFAULT_STATUS);
            entity.setOrgId(currentOrgId());
            applyRequest(entity, request);
            mapper.insert(entity);
        } else {
            entity = require(id);
            applyRequest(entity, request);
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 删除集成接口定义：物理删除以释放接口编号。 */
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    private IntgPlmMesInterface require(Long id) {
        IntgPlmMesInterface entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "集成接口不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空）时覆盖实体对应字段。 */
    private void applyRequest(IntgPlmMesInterface entity, IntgPlmMesInterfaceSaveRequest request) {
        if (StringUtils.hasText(request.getInterfaceNo())) {
            entity.setInterfaceNo(request.getInterfaceNo());
        }
        if (StringUtils.hasText(request.getInterfaceName())) {
            entity.setInterfaceName(request.getInterfaceName());
        }
        if (StringUtils.hasText(request.getDirection())) {
            entity.setDirection(request.getDirection());
        }
        if (StringUtils.hasText(request.getObjectType())) {
            entity.setObjectType(request.getObjectType());
        }
        if (StringUtils.hasText(request.getProtocol())) {
            entity.setProtocol(request.getProtocol());
        }
        if (StringUtils.hasText(request.getEndpoint())) {
            entity.setEndpoint(request.getEndpoint());
        }
        if (StringUtils.hasText(request.getTriggerType())) {
            entity.setTriggerType(request.getTriggerType());
        }
        if (StringUtils.hasText(request.getSyncMode())) {
            entity.setSyncMode(request.getSyncMode());
        }
        if (StringUtils.hasText(request.getInterfaceStatus())) {
            entity.setInterfaceStatus(request.getInterfaceStatus());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            entity.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getDescription())) {
            entity.setDescription(request.getDescription());
        }
        if (StringUtils.hasText(request.getRemark())) {
            entity.setRemark(request.getRemark());
        }
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
