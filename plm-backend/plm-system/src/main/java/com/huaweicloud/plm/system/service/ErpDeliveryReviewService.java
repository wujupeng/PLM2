package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpDeliveryReviewQuery;
import com.huaweicloud.plm.system.dto.ErpDeliveryReviewSaveRequest;
import com.huaweicloud.plm.system.entity.ErpDeliveryReview;
import com.huaweicloud.plm.system.mapper.ErpDeliveryReviewMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * ERP 销售管理—交期评审（G3-N2 ERP 销售管理）：
 * 交期评审登记、分页查询与删除。
 * 评审单号支持人工指定，删除语义为「释放编号」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpDeliveryReviewService {

    private static final String DEFAULT_REVIEW_NO_PREFIX = "SDR";
    private static final String DEFAULT_REVIEW_RESULT = "PENDING";
    private static final String DEFAULT_REVIEW_STATUS = "OPEN";

    private final ErpDeliveryReviewMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询交期评审：状态/结果/订单号精确，单号/订单号/物料编码模糊，按主键倒序。 */
    public PageResult<ErpDeliveryReview> pageDeliveryReviews(ErpDeliveryReviewQuery query) {
        Page<ErpDeliveryReview> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpDeliveryReview>lambdaQuery()
                .eq(StringUtils.hasText(query.getReviewStatus()),
                        ErpDeliveryReview::getReviewStatus, query.getReviewStatus())
                .eq(StringUtils.hasText(query.getReviewResult()),
                        ErpDeliveryReview::getReviewResult, query.getReviewResult())
                .eq(StringUtils.hasText(query.getOrderNo()),
                        ErpDeliveryReview::getOrderNo, query.getOrderNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpDeliveryReview::getReviewNo, query.getKeyword()).or()
                        .like(ErpDeliveryReview::getOrderNo, query.getKeyword()).or()
                        .like(ErpDeliveryReview::getMaterialCode, query.getKeyword()))
                .orderByDesc(ErpDeliveryReview::getId));
        return PageResult.of(page);
    }

    public ErpDeliveryReview detail(Long id) {
        return require(id);
    }

    /** 新增或更新交期评审：新增时回填默认评审结果/状态与组织，单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpDeliveryReviewSaveRequest request) {
        ErpDeliveryReview entity;
        if (id == null) {
            entity = new ErpDeliveryReview();
            entity.setReviewNo(StringUtils.hasText(request.getReviewNo())
                    ? request.getReviewNo() : flowSupport.nextBizNo(DEFAULT_REVIEW_NO_PREFIX));
            entity.setReviewResult(StringUtils.hasText(request.getReviewResult())
                    ? request.getReviewResult() : DEFAULT_REVIEW_RESULT);
            entity.setReviewStatus(StringUtils.hasText(request.getReviewStatus())
                    ? request.getReviewStatus() : DEFAULT_REVIEW_STATUS);
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

    /** 删除交期评审：物理删除以释放评审单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpDeliveryReview require(Long id) {
        ErpDeliveryReview entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "交期评审不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpDeliveryReview entity, ErpDeliveryReviewSaveRequest request) {
        if (StringUtils.hasText(request.getReviewNo())) {
            entity.setReviewNo(request.getReviewNo());
        }
        if (StringUtils.hasText(request.getOrderNo())) {
            entity.setOrderNo(request.getOrderNo());
        }
        if (request.getOrderLineNo() != null) {
            entity.setOrderLineNo(request.getOrderLineNo());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (request.getCustomerRequestDate() != null) {
            entity.setCustomerRequestDate(request.getCustomerRequestDate());
        }
        if (request.getPromisedDate() != null) {
            entity.setPromisedDate(request.getPromisedDate());
        }
        if (StringUtils.hasText(request.getReviewResult())) {
            entity.setReviewResult(request.getReviewResult());
        }
        if (StringUtils.hasText(request.getReviewOpinion())) {
            entity.setReviewOpinion(request.getReviewOpinion());
        }
        if (StringUtils.hasText(request.getReviewer())) {
            entity.setReviewer(request.getReviewer());
        }
        if (request.getReviewDate() != null) {
            entity.setReviewDate(request.getReviewDate());
        }
        if (StringUtils.hasText(request.getReviewStatus())) {
            entity.setReviewStatus(request.getReviewStatus());
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
