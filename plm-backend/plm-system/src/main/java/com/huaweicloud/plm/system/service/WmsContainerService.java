package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WmsContainerQuery;
import com.huaweicloud.plm.system.dto.WmsContainerSaveRequest;
import com.huaweicloud.plm.system.entity.WmsContainer;
import com.huaweicloud.plm.system.mapper.WmsContainerMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * WMS 仓储基础—容器管理（对应容器管理）：
 * 容器登记、分页查询与删除。
 * 容器编码支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class WmsContainerService {

    private static final String DEFAULT_CONTAINER_NO_PREFIX = "CTN";
    private static final String DEFAULT_CONTAINER_TYPE = "PALLET";
    private static final String DEFAULT_CONTAINER_STATUS = "IDLE";

    private final WmsContainerMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询容器记录：容器类型/容器状态精确，容器编码/容器名称/条码/当前库位编码模糊，按主键倒序。 */
    public PageResult<WmsContainer> page(WmsContainerQuery query) {
        Page<WmsContainer> page = query.toPage();
        mapper.selectPage(page, Wrappers.<WmsContainer>lambdaQuery()
                .eq(StringUtils.hasText(query.getContainerType()),
                        WmsContainer::getContainerType, query.getContainerType())
                .eq(StringUtils.hasText(query.getContainerStatus()),
                        WmsContainer::getContainerStatus, query.getContainerStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(WmsContainer::getContainerCode, query.getKeyword()).or()
                        .like(WmsContainer::getContainerName, query.getKeyword()).or()
                        .like(WmsContainer::getBarcode, query.getKeyword()).or()
                        .like(WmsContainer::getCurrentBinCode, query.getKeyword()))
                .orderByDesc(WmsContainer::getId));
        return PageResult.of(page);
    }

    public WmsContainer detail(Long id) {
        return require(id);
    }

    /** 新增或更新容器记录：新增时回填默认容器类型/容器状态与组织，容器编码为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, WmsContainerSaveRequest request) {
        WmsContainer entity;
        if (id == null) {
            entity = new WmsContainer();
            entity.setContainerCode(StringUtils.hasText(request.getContainerCode())
                    ? request.getContainerCode() : flowSupport.nextBizNo(DEFAULT_CONTAINER_NO_PREFIX));
            entity.setContainerType(StringUtils.hasText(request.getContainerType())
                    ? request.getContainerType() : DEFAULT_CONTAINER_TYPE);
            entity.setContainerStatus(StringUtils.hasText(request.getContainerStatus())
                    ? request.getContainerStatus() : DEFAULT_CONTAINER_STATUS);
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
        }
        applyRequest(entity, request);
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 删除容器记录：物理删除以释放容器编码。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public WmsContainer require(Long id) {
        WmsContainer entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "容器不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非空）时覆盖实体对应字段。 */
    private void applyRequest(WmsContainer entity, WmsContainerSaveRequest request) {
        if (StringUtils.hasText(request.getContainerCode())) {
            entity.setContainerCode(request.getContainerCode());
        }
        if (StringUtils.hasText(request.getContainerName())) {
            entity.setContainerName(request.getContainerName());
        }
        if (StringUtils.hasText(request.getContainerType())) {
            entity.setContainerType(request.getContainerType());
        }
        if (request.getCapacity() != null) {
            entity.setCapacity(request.getCapacity());
        }
        if (StringUtils.hasText(request.getCapacityUnit())) {
            entity.setCapacityUnit(request.getCapacityUnit());
        }
        if (StringUtils.hasText(request.getCurrentBinCode())) {
            entity.setCurrentBinCode(request.getCurrentBinCode());
        }
        if (StringUtils.hasText(request.getBarcode())) {
            entity.setBarcode(request.getBarcode());
        }
        if (StringUtils.hasText(request.getContainerStatus())) {
            entity.setContainerStatus(request.getContainerStatus());
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
