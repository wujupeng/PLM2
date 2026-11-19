package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MigMasterDataCompensationQuery;
import com.huaweicloud.plm.system.dto.MigMasterDataCompensationSaveRequest;
import com.huaweicloud.plm.system.entity.MigMasterDataCompensation;
import com.huaweicloud.plm.system.mapper.MigMasterDataCompensationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 主数据迁移异常补偿服务：异常补偿的登记、分页查询与删除。
 * 补偿编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class MigMasterDataCompensationService {

    private static final String DEFAULT_NO_PREFIX = "MGC";
    private static final String DEFAULT_OBJECT_TYPE = "MATERIAL";
    private static final String DEFAULT_ERROR_TYPE = "VALIDATION";
    private static final Integer DEFAULT_RETRY_COUNT = 0;
    private static final String DEFAULT_COMPENSATION_STATUS = "PENDING";

    private final MigMasterDataCompensationMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询异常补偿：对象类型/错误类型/补偿状态/批次号精确，补偿编号/对象编号/错误信息模糊，按主键倒序。 */
    public PageResult<MigMasterDataCompensation> page(MigMasterDataCompensationQuery query) {
        String keyword = query.getKeyword();
        Page<MigMasterDataCompensation> page = mapper.selectPage(query.toPage(), Wrappers.<MigMasterDataCompensation>lambdaQuery()
                .eq(StringUtils.hasText(query.getObjectType()), MigMasterDataCompensation::getObjectType, query.getObjectType())
                .eq(StringUtils.hasText(query.getErrorType()), MigMasterDataCompensation::getErrorType, query.getErrorType())
                .eq(StringUtils.hasText(query.getCompensationStatus()), MigMasterDataCompensation::getCompensationStatus, query.getCompensationStatus())
                .eq(StringUtils.hasText(query.getBatchNo()), MigMasterDataCompensation::getBatchNo, query.getBatchNo())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MigMasterDataCompensation::getCompensationNo, keyword).or()
                        .like(MigMasterDataCompensation::getObjectNo, keyword).or()
                        .like(MigMasterDataCompensation::getErrorMessage, keyword))
                .orderByDesc(MigMasterDataCompensation::getId));
        return PageResult.of(page);
    }

    public MigMasterDataCompensation detail(Long id) {
        return require(id);
    }

    /** 新增或更新异常补偿：新增时回填默认对象类型/错误类型/重试次数/补偿状态与组织，补偿编号为空时自动生成。 */
    public Long save(Long id, MigMasterDataCompensationSaveRequest request) {
        MigMasterDataCompensation entity;
        if (id == null) {
            entity = new MigMasterDataCompensation();
            entity.setCompensationNo(StringUtils.hasText(request.getCompensationNo())
                    ? request.getCompensationNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setObjectType(StringUtils.hasText(request.getObjectType())
                    ? request.getObjectType() : DEFAULT_OBJECT_TYPE);
            entity.setErrorType(StringUtils.hasText(request.getErrorType())
                    ? request.getErrorType() : DEFAULT_ERROR_TYPE);
            entity.setRetryCount(request.getRetryCount() == null
                    ? DEFAULT_RETRY_COUNT : request.getRetryCount());
            entity.setCompensationStatus(StringUtils.hasText(request.getCompensationStatus())
                    ? request.getCompensationStatus() : DEFAULT_COMPENSATION_STATUS);
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

    /** 删除异常补偿：物理删除以释放补偿编号。 */
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    private MigMasterDataCompensation require(Long id) {
        MigMasterDataCompensation entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "异常补偿不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(MigMasterDataCompensation entity, MigMasterDataCompensationSaveRequest request) {
        if (StringUtils.hasText(request.getCompensationNo())) {
            entity.setCompensationNo(request.getCompensationNo());
        }
        if (StringUtils.hasText(request.getBatchNo())) {
            entity.setBatchNo(request.getBatchNo());
        }
        if (StringUtils.hasText(request.getInterfaceNo())) {
            entity.setInterfaceNo(request.getInterfaceNo());
        }
        if (StringUtils.hasText(request.getObjectType())) {
            entity.setObjectType(request.getObjectType());
        }
        if (StringUtils.hasText(request.getObjectNo())) {
            entity.setObjectNo(request.getObjectNo());
        }
        if (StringUtils.hasText(request.getErrorType())) {
            entity.setErrorType(request.getErrorType());
        }
        if (StringUtils.hasText(request.getErrorMessage())) {
            entity.setErrorMessage(request.getErrorMessage());
        }
        if (request.getRetryCount() != null) {
            entity.setRetryCount(request.getRetryCount());
        }
        if (StringUtils.hasText(request.getHandler())) {
            entity.setHandler(request.getHandler());
        }
        if (request.getHandleTime() != null) {
            entity.setHandleTime(request.getHandleTime());
        }
        if (StringUtils.hasText(request.getCompensationStatus())) {
            entity.setCompensationStatus(request.getCompensationStatus());
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
