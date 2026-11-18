package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpBarcodeReprintQuery;
import com.huaweicloud.plm.system.dto.ErpBarcodeReprintSaveRequest;
import com.huaweicloud.plm.system.entity.ErpBarcodeReprint;
import com.huaweicloud.plm.system.mapper.ErpBarcodeReprintMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * ERP 条码管理—补打记录（对应 G3-N7a ERP 条码管理）：
 * 补打记录登记、分页查询与删除。
 * 补打单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpBarcodeReprintService {

    private static final String DEFAULT_REPRINT_NO_PREFIX = "BCR";
    private static final String DEFAULT_APPROVAL_STATUS = "NONE";

    private final ErpBarcodeReprintMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询补打记录：审批状态/条码编号精确，补打单号/条码编号/操作人姓名模糊，按主键倒序。 */
    public PageResult<ErpBarcodeReprint> page(ErpBarcodeReprintQuery query) {
        Page<ErpBarcodeReprint> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpBarcodeReprint>lambdaQuery()
                .eq(StringUtils.hasText(query.getApprovalStatus()),
                        ErpBarcodeReprint::getApprovalStatus, query.getApprovalStatus())
                .eq(StringUtils.hasText(query.getBarcodeNo()),
                        ErpBarcodeReprint::getBarcodeNo, query.getBarcodeNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpBarcodeReprint::getReprintNo, query.getKeyword()).or()
                        .like(ErpBarcodeReprint::getBarcodeNo, query.getKeyword()).or()
                        .like(ErpBarcodeReprint::getOperatorName, query.getKeyword()))
                .orderByDesc(ErpBarcodeReprint::getId));
        return PageResult.of(page);
    }

    public ErpBarcodeReprint detail(Long id) {
        return require(id);
    }

    /** 新增或更新补打记录：新增时回填默认补打次数/审批状态与组织，补打单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpBarcodeReprintSaveRequest request) {
        ErpBarcodeReprint entity;
        if (id == null) {
            entity = new ErpBarcodeReprint();
            entity.setReprintNo(StringUtils.hasText(request.getReprintNo())
                    ? request.getReprintNo() : flowSupport.nextBizNo(DEFAULT_REPRINT_NO_PREFIX));
            entity.setReprintCount(request.getReprintCount() != null
                    ? request.getReprintCount() : 1);
            entity.setApprovalStatus(StringUtils.hasText(request.getApprovalStatus())
                    ? request.getApprovalStatus() : DEFAULT_APPROVAL_STATUS);
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

    /** 删除补打记录：物理删除以释放补打单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpBarcodeReprint require(Long id) {
        ErpBarcodeReprint entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "补打记录不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpBarcodeReprint entity, ErpBarcodeReprintSaveRequest request) {
        if (StringUtils.hasText(request.getReprintNo())) {
            entity.setReprintNo(request.getReprintNo());
        }
        if (StringUtils.hasText(request.getBarcodeNo())) {
            entity.setBarcodeNo(request.getBarcodeNo());
        }
        if (StringUtils.hasText(request.getReprintReason())) {
            entity.setReprintReason(request.getReprintReason());
        }
        if (request.getReprintCount() != null) {
            entity.setReprintCount(request.getReprintCount());
        }
        if (request.getReprintTime() != null) {
            entity.setReprintTime(request.getReprintTime());
        }
        if (StringUtils.hasText(request.getOperatorName())) {
            entity.setOperatorName(request.getOperatorName());
        }
        if (StringUtils.hasText(request.getApprovalStatus())) {
            entity.setApprovalStatus(request.getApprovalStatus());
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
