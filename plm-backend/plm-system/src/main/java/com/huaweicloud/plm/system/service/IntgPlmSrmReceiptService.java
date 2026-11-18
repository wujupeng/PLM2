package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.IntgPlmSrmReceiptQuery;
import com.huaweicloud.plm.system.dto.IntgPlmSrmReceiptSaveRequest;
import com.huaweicloud.plm.system.entity.IntgPlmSrmReceipt;
import com.huaweicloud.plm.system.mapper.IntgPlmSrmReceiptMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * SRM 接收回执服务：接收回执的登记、分页查询与删除。
 * 回执编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class IntgPlmSrmReceiptService {

    private static final String DEFAULT_NO_PREFIX = "PSR";
    private static final String DEFAULT_OBJECT_TYPE = "PURCHASE_SPEC";
    private static final String DEFAULT_RECEIPT_STATUS = "PENDING";

    private final IntgPlmSrmReceiptMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询接收回执：对象类型/回执状态/批次号精确，回执编号/对象编号/SRM 对象标识模糊，按主键倒序。 */
    public PageResult<IntgPlmSrmReceipt> page(IntgPlmSrmReceiptQuery query) {
        String keyword = query.getKeyword();
        Page<IntgPlmSrmReceipt> page = mapper.selectPage(query.toPage(), Wrappers.<IntgPlmSrmReceipt>lambdaQuery()
                .eq(StringUtils.hasText(query.getObjectType()), IntgPlmSrmReceipt::getObjectType, query.getObjectType())
                .eq(StringUtils.hasText(query.getReceiptStatus()), IntgPlmSrmReceipt::getReceiptStatus, query.getReceiptStatus())
                .eq(StringUtils.hasText(query.getBatchNo()), IntgPlmSrmReceipt::getBatchNo, query.getBatchNo())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(IntgPlmSrmReceipt::getReceiptNo, keyword).or()
                        .like(IntgPlmSrmReceipt::getObjectNo, keyword).or()
                        .like(IntgPlmSrmReceipt::getSrmObjectId, keyword))
                .orderByDesc(IntgPlmSrmReceipt::getId));
        return PageResult.of(page);
    }

    public IntgPlmSrmReceipt detail(Long id) {
        return require(id);
    }

    /** 新增或更新接收回执：新增时回填默认对象类型/回执状态与组织，回执编号为空时自动生成。 */
    public Long save(Long id, IntgPlmSrmReceiptSaveRequest request) {
        IntgPlmSrmReceipt entity;
        if (id == null) {
            entity = new IntgPlmSrmReceipt();
            entity.setReceiptNo(StringUtils.hasText(request.getReceiptNo())
                    ? request.getReceiptNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setObjectType(StringUtils.hasText(request.getObjectType())
                    ? request.getObjectType() : DEFAULT_OBJECT_TYPE);
            entity.setReceiptStatus(StringUtils.hasText(request.getReceiptStatus())
                    ? request.getReceiptStatus() : DEFAULT_RECEIPT_STATUS);
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

    /** 删除接收回执：物理删除以释放回执编号。 */
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    private IntgPlmSrmReceipt require(Long id) {
        IntgPlmSrmReceipt entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "接收回执不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(IntgPlmSrmReceipt entity, IntgPlmSrmReceiptSaveRequest request) {
        if (StringUtils.hasText(request.getReceiptNo())) {
            entity.setReceiptNo(request.getReceiptNo());
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
        if (StringUtils.hasText(request.getObjectVersion())) {
            entity.setObjectVersion(request.getObjectVersion());
        }
        if (StringUtils.hasText(request.getSrmObjectId())) {
            entity.setSrmObjectId(request.getSrmObjectId());
        }
        if (StringUtils.hasText(request.getReceiptStatus())) {
            entity.setReceiptStatus(request.getReceiptStatus());
        }
        if (StringUtils.hasText(request.getCheckMessage())) {
            entity.setCheckMessage(request.getCheckMessage());
        }
        if (request.getReceiptTime() != null) {
            entity.setReceiptTime(request.getReceiptTime());
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
