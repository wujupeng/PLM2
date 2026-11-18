package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.EcoApproveRequest;
import com.huaweicloud.plm.system.dto.EcoChangeItemSaveRequest;
import com.huaweicloud.plm.system.dto.EcoDetailResponse;
import com.huaweicloud.plm.system.dto.EcoExecuteRequest;
import com.huaweicloud.plm.system.dto.EcoExecuteResult;
import com.huaweicloud.plm.system.dto.EcoImpactAnalyzeRequest;
import com.huaweicloud.plm.system.dto.EcoImpactHandleRequest;
import com.huaweicloud.plm.system.dto.EcoNoticeSaveRequest;
import com.huaweicloud.plm.system.dto.EcoQuery;
import com.huaweicloud.plm.system.dto.EcoSaveRequest;
import com.huaweicloud.plm.system.entity.BomHeader;
import com.huaweicloud.plm.system.entity.EcoChangeItem;
import com.huaweicloud.plm.system.entity.EcoChangeOrder;
import com.huaweicloud.plm.system.entity.EcoImpactAnalysis;
import com.huaweicloud.plm.system.entity.EcoNotice;
import com.huaweicloud.plm.system.entity.MdMaterial;
import com.huaweicloud.plm.system.entity.MdProduct;
import com.huaweicloud.plm.system.mapper.BomHeaderMapper;
import com.huaweicloud.plm.system.mapper.EcoChangeItemMapper;
import com.huaweicloud.plm.system.mapper.EcoChangeOrderMapper;
import com.huaweicloud.plm.system.mapper.EcoImpactAnalysisMapper;
import com.huaweicloud.plm.system.mapper.EcoNoticeMapper;
import com.huaweicloud.plm.system.mapper.MdMaterialMapper;
import com.huaweicloud.plm.system.mapper.MdProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 工程变更单（ECO）服务（DEV-040 / DEV-041）：明细维护、审批、影响分析与变更执行。
 */
@Service
@RequiredArgsConstructor
public class EcoService {

    private static final DateTimeFormatter MONTH_FORMAT = DateTimeFormatter.ofPattern("yyyyMM");

    private static final String ECO_NO_CODE = "ECO";
    private static final String NOTICE_NO_CODE = "ECN";

    private static final String STATUS_DRAFT = "draft";
    private static final String STATUS_SUBMITTED = "submitted";
    private static final String STATUS_APPROVED = "approved";
    private static final String STATUS_REJECTED = "rejected";

    private static final String EXEC_EXECUTING = "executing";
    private static final String EXEC_COMPLETED = "completed";

    private static final String SWITCH_STATUS_PENDING = "pending";
    private static final String SWITCH_STATUS_SWITCHED = "switched";

    private static final String HANDLE_STATUS_PENDING = "pending";

    private static final String DECISION_APPROVED = "approved";

    private static final String CHANGE_ACTION_DEFAULT = "modify";

    private static final String NOTICE_STATUS_DRAFT = "draft";
    private static final String NOTICE_STATUS_SENT = "sent";
    private static final String NOTICE_STATUS_CONFIRMED = "confirmed";

    private static final String CONFIG_IMPACT_TYPES = "eco.impact.types";
    private static final String CONFIG_NOTICE_AUTO_SEND = "eco.notice.auto_send";
    private static final List<String> DEFAULT_IMPACT_TYPES =
            List.of("bom", "inventory", "po", "wip", "supplier", "customer");

    private static final String OBJECT_TYPE_BOM = "bom";
    private static final String OBJECT_TYPE_MATERIAL = "material";
    private static final String OBJECT_TYPE_PRODUCT = "product";
    private static final String OBJECT_TYPE_DOCUMENT = "document";
    private static final String OBJECT_TYPE_PROCESS = "process";

    private static final String IMPACT_TYPE_BOM = "bom";
    private static final String IMPACT_TYPE_INVENTORY = "inventory";
    private static final String IMPACT_TYPE_PO = "po";
    private static final String IMPACT_TYPE_WIP = "wip";
    private static final String IMPACT_TYPE_SUPPLIER = "supplier";
    private static final String IMPACT_TYPE_CUSTOMER = "customer";

    private static final String VALUE_MATERIAL_MISSING = "物料不存在";
    private static final String VALUE_PRODUCT_MISSING = "产品不存在";

    private final EcoChangeOrderMapper changeOrderMapper;
    private final EcoChangeItemMapper changeItemMapper;
    private final EcoNoticeMapper noticeMapper;
    private final EcoImpactAnalysisMapper impactMapper;
    private final BomHeaderMapper bomHeaderMapper;
    private final MdMaterialMapper materialMapper;
    private final MdProductMapper productMapper;
    private final ConfigService configService;

    public PageResult<EcoChangeOrder> page(EcoQuery query) {
        Page<EcoChangeOrder> page = query.toPage();
        changeOrderMapper.selectPage(page, Wrappers.<EcoChangeOrder>lambdaQuery()
                .eq(StringUtils.hasText(query.getEcoNo()), EcoChangeOrder::getEcoNo, query.getEcoNo())
                .eq(StringUtils.hasText(query.getEcrNo()), EcoChangeOrder::getEcrNo, query.getEcrNo())
                .eq(StringUtils.hasText(query.getApprovalStatus()),
                        EcoChangeOrder::getApprovalStatus, query.getApprovalStatus())
                .eq(StringUtils.hasText(query.getExecutionStatus()),
                        EcoChangeOrder::getExecutionStatus, query.getExecutionStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(EcoChangeOrder::getEcoNo, query.getKeyword()).or()
                        .like(EcoChangeOrder::getTitle, query.getKeyword()))
                .orderByDesc(EcoChangeOrder::getCreatedAt));
        return PageResult.of(page);
    }

    public EcoDetailResponse detail(Long ecoId) {
        EcoChangeOrder order = requireOrder(ecoId);
        EcoDetailResponse response = new EcoDetailResponse();
        response.setOrder(order);
        response.setItems(listItems(ecoId));
        response.setNotices(listNotices(ecoId));
        response.setImpacts(listImpacts(ecoId));
        return response;
    }

    public List<EcoChangeItem> listItems(Long ecoId) {
        requireOrder(ecoId);
        return changeItemMapper.selectList(Wrappers.<EcoChangeItem>lambdaQuery()
                .eq(EcoChangeItem::getEcoId, ecoId)
                .orderByAsc(EcoChangeItem::getId));
    }

    public List<EcoNotice> listNotices(Long ecoId) {
        requireOrder(ecoId);
        return noticeMapper.selectList(Wrappers.<EcoNotice>lambdaQuery()
                .eq(EcoNotice::getEcoId, ecoId)
                .orderByAsc(EcoNotice::getId));
    }

    public List<EcoImpactAnalysis> listImpacts(Long ecoId) {
        requireOrder(ecoId);
        return queryImpacts(ecoId);
    }

    @Transactional
    public void update(Long ecoId, EcoSaveRequest request) {
        EcoChangeOrder order = requireOrder(ecoId);
        applyOrder(order, request);
        changeOrderMapper.updateById(order);
    }

    @Transactional
    public Long addItem(Long ecoId, EcoChangeItemSaveRequest request) {
        requireOrder(ecoId);
        validateItem(request);
        EcoChangeItem item = new EcoChangeItem();
        item.setEcoId(ecoId);
        applyItem(item, request);
        item.setChangeAction(StringUtils.hasText(request.getChangeAction())
                ? request.getChangeAction() : CHANGE_ACTION_DEFAULT);
        item.setSwitchStatus(SWITCH_STATUS_PENDING);
        changeItemMapper.insert(item);
        return item.getId();
    }

    @Transactional
    public void updateItem(Long itemId, EcoChangeItemSaveRequest request) {
        EcoChangeItem item = requireItem(itemId);
        validateItem(request);
        applyItem(item, request);
        changeItemMapper.updateById(item);
    }

    @Transactional
    public void deleteItem(Long itemId) {
        requireItem(itemId);
        changeItemMapper.deleteById(itemId);
    }

    @Transactional
    public void submit(Long ecoId) {
        EcoChangeOrder order = requireOrder(ecoId);
        if (!STATUS_DRAFT.equalsIgnoreCase(order.getApprovalStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "当前状态不允许提交");
        }
        order.setApprovalStatus(STATUS_SUBMITTED);
        changeOrderMapper.updateById(order);
    }

    @Transactional
    public void approve(Long ecoId, EcoApproveRequest request) {
        EcoChangeOrder order = requireOrder(ecoId);
        if (!STATUS_SUBMITTED.equalsIgnoreCase(order.getApprovalStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "当前状态不允许审批");
        }
        order.setApproverId(UserContext.getUserId());
        order.setApproverName(UserContext.getUsername());
        order.setApprovalComment(request.getComment());
        if (DECISION_APPROVED.equalsIgnoreCase(request.getDecision())) {
            order.setApprovalStatus(STATUS_APPROVED);
            order.setApprovedAt(LocalDateTime.now());
        } else {
            order.setApprovalStatus(STATUS_REJECTED);
        }
        changeOrderMapper.updateById(order);
    }

    /**
     * 影响分析：先清除未处理的旧记录，再按变更对象明细展开生成影响记录，仅保留指定影响类型。
     */
    @Transactional
    public List<EcoImpactAnalysis> analyzeImpacts(Long ecoId, EcoImpactAnalyzeRequest request) {
        requireOrder(ecoId);
        Set<String> includeTypes = resolveImpactTypes(request);

        impactMapper.delete(Wrappers.<EcoImpactAnalysis>lambdaQuery()
                .eq(EcoImpactAnalysis::getEcoId, ecoId)
                .eq(EcoImpactAnalysis::getHandleStatus, HANDLE_STATUS_PENDING));

        List<EcoChangeItem> items = changeItemMapper.selectList(Wrappers.<EcoChangeItem>lambdaQuery()
                .eq(EcoChangeItem::getEcoId, ecoId)
                .orderByAsc(EcoChangeItem::getId));

        List<EcoImpactAnalysis> candidates = new ArrayList<>();
        for (EcoChangeItem item : items) {
            String objectType = item.getObjectType() == null ? "" : item.getObjectType().toLowerCase();
            switch (objectType) {
                case OBJECT_TYPE_BOM -> appendBomImpact(candidates, item);
                case OBJECT_TYPE_MATERIAL -> appendMaterialImpacts(candidates, item);
                case OBJECT_TYPE_PRODUCT -> appendProductImpact(candidates, item);
                case OBJECT_TYPE_DOCUMENT -> appendDocumentImpact(candidates, item);
                case OBJECT_TYPE_PROCESS -> appendProcessImpact(candidates, item);
                default -> {
                    // 其它对象类型不参与影响分析
                }
            }
        }

        for (EcoImpactAnalysis impact : candidates) {
            if (!includeTypes.contains(impact.getImpactType())) {
                continue;
            }
            impactMapper.insert(impact);
        }
        return queryImpacts(ecoId);
    }

    @Transactional
    public void handleImpact(Long impactId, EcoImpactHandleRequest request) {
        EcoImpactAnalysis impact = requireImpact(impactId);
        impact.setHandleStatus(request.getHandleStatus());
        impact.setHandleRemark(request.getHandleRemark());
        impact.setHandledAt(LocalDateTime.now());
        impactMapper.updateById(impact);
    }

    /**
     * 变更执行：按入参切换指定明细的版本，统计切换进度并更新执行状态。
     */
    @Transactional
    public EcoExecuteResult execute(Long ecoId, EcoExecuteRequest request) {
        EcoChangeOrder order = requireOrder(ecoId);
        if (!STATUS_APPROVED.equalsIgnoreCase(order.getApprovalStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "ECO 未批准，不能执行变更");
        }
        List<EcoChangeItem> items = changeItemMapper.selectList(Wrappers.<EcoChangeItem>lambdaQuery()
                .eq(EcoChangeItem::getEcoId, ecoId)
                .orderByAsc(EcoChangeItem::getId));
        if (items.isEmpty()) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "缺少变更对象明细");
        }

        Set<Long> switchedIds = new HashSet<>();
        if (request != null && !CollectionUtils.isEmpty(request.getSwitchedItems())) {
            switchedIds.addAll(request.getSwitchedItems());
        }
        LocalDateTime now = LocalDateTime.now();
        int switched = 0;
        int pending = 0;
        for (EcoChangeItem item : items) {
            if (switchedIds.contains(item.getId())) {
                item.setSwitchStatus(SWITCH_STATUS_SWITCHED);
                item.setSwitchedAt(now);
                changeItemMapper.updateById(item);
                switched++;
            } else if (SWITCH_STATUS_SWITCHED.equalsIgnoreCase(item.getSwitchStatus())) {
                switched++;
            } else {
                pending++;
            }
        }

        if (request != null) {
            if (request.getEffectiveDate() != null) {
                order.setEffectiveDate(request.getEffectiveDate());
            }
            if (StringUtils.hasText(request.getEffectiveBatch())) {
                order.setEffectiveBatch(request.getEffectiveBatch());
            }
        }
        if (pending == 0) {
            order.setExecutionStatus(EXEC_COMPLETED);
            order.setExecutedAt(now);
        } else {
            order.setExecutionStatus(EXEC_EXECUTING);
        }
        changeOrderMapper.updateById(order);

        EcoExecuteResult result = new EcoExecuteResult();
        result.setEcoId(ecoId);
        result.setExecutionStatus(order.getExecutionStatus());
        result.setSwitched(switched);
        result.setPending(pending);
        result.setMessage("已切换 " + switched + " 项，待切换 " + pending + " 项");
        return result;
    }

    @Transactional
    public Long createNotice(Long ecoId, EcoNoticeSaveRequest request) {
        EcoChangeOrder order = requireOrder(ecoId);
        EcoNotice notice = new EcoNotice();
        notice.setEcoId(ecoId);
        notice.setEcoNo(order.getEcoNo());
        notice.setNoticeNo(generateNoticeNo());
        notice.setTitle(request.getTitle());
        notice.setContent(request.getContent());
        notice.setTargetType(request.getTargetType());
        notice.setTargetCode(request.getTargetCode());
        notice.setTargetName(request.getTargetName());
        notice.setRemark(request.getRemark());
        if (Boolean.parseBoolean(configService.getValue(CONFIG_NOTICE_AUTO_SEND))) {
            notice.setStatus(NOTICE_STATUS_SENT);
            notice.setSentAt(LocalDateTime.now());
        } else {
            notice.setStatus(NOTICE_STATUS_DRAFT);
        }
        noticeMapper.insert(notice);
        return notice.getId();
    }

    @Transactional
    public void sendNotice(Long noticeId) {
        EcoNotice notice = requireNotice(noticeId);
        notice.setStatus(NOTICE_STATUS_SENT);
        notice.setSentAt(LocalDateTime.now());
        noticeMapper.updateById(notice);
    }

    @Transactional
    public void confirmNotice(Long noticeId) {
        EcoNotice notice = requireNotice(noticeId);
        notice.setStatus(NOTICE_STATUS_CONFIRMED);
        notice.setConfirmedAt(LocalDateTime.now());
        noticeMapper.updateById(notice);
    }

    private List<EcoImpactAnalysis> queryImpacts(Long ecoId) {
        return impactMapper.selectList(Wrappers.<EcoImpactAnalysis>lambdaQuery()
                .eq(EcoImpactAnalysis::getEcoId, ecoId)
                .orderByAsc(EcoImpactAnalysis::getId));
    }

    /** 影响类型：入参优先，其次配置 eco.impact.types，配置为空时取默认全部类型。 */
    private Set<String> resolveImpactTypes(EcoImpactAnalyzeRequest request) {
        List<String> raw = request == null ? null : request.getIncludeTypes();
        if (!CollectionUtils.isEmpty(raw)) {
            return new HashSet<>(normalize(raw));
        }
        String config = configService.getValue(CONFIG_IMPACT_TYPES);
        List<String> configured = StringUtils.hasText(config)
                ? Arrays.asList(config.split(","))
                : DEFAULT_IMPACT_TYPES;
        Set<String> types = new HashSet<>(normalize(configured));
        return types.isEmpty() ? new HashSet<>(DEFAULT_IMPACT_TYPES) : types;
    }

    private List<String> normalize(List<String> values) {
        List<String> result = new ArrayList<>();
        for (String value : values) {
            if (StringUtils.hasText(value)) {
                result.add(value.trim().toLowerCase());
            }
        }
        return result;
    }

    private void appendBomImpact(List<EcoImpactAnalysis> list, EcoChangeItem item) {
        long count = bomHeaderMapper.selectCount(Wrappers.<BomHeader>lambdaQuery()
                .eq(BomHeader::getProductCode, item.getObjectCode()).or()
                .eq(BomHeader::getBomCode, item.getObjectCode()));
        EcoImpactAnalysis impact = newImpact(item, IMPACT_TYPE_BOM);
        impact.setCurrentValue("关联 BOM " + count + " 个版本");
        impact.setImpactDesc("BOM 结构需按变更后版本重新发布");
        list.add(impact);
    }

    private void appendMaterialImpacts(List<EcoImpactAnalysis> list, EcoChangeItem item) {
        MdMaterial material = findMaterial(item.getObjectCode());
        boolean exists = material != null;
        String code = exists ? material.getMaterialCode() : item.getObjectCode();
        String name = exists ? material.getMaterialName() : item.getObjectName();
        String version = exists ? material.getVersionNo() : null;
        String missingValue = exists ? null : VALUE_MATERIAL_MISSING;

        EcoImpactAnalysis inventory = newImpact(item, IMPACT_TYPE_INVENTORY);
        inventory.setObjectCode(code);
        inventory.setObjectName(name);
        inventory.setCurrentValue(exists ? version : VALUE_MATERIAL_MISSING);
        inventory.setImpactDesc("需核对库存与在途批次，按变更生效日期切换");
        list.add(inventory);

        EcoImpactAnalysis po = newImpact(item, IMPACT_TYPE_PO);
        po.setObjectCode(code);
        po.setObjectName(name);
        po.setCurrentValue(missingValue);
        po.setImpactDesc("需核对未清采购订单，与供应商确认切换时点");
        list.add(po);

        EcoImpactAnalysis wip = newImpact(item, IMPACT_TYPE_WIP);
        wip.setObjectCode(code);
        wip.setObjectName(name);
        wip.setCurrentValue(missingValue);
        wip.setImpactDesc("需核对在制工单用料版本");
        list.add(wip);

        if (exists && StringUtils.hasText(material.getSupplierCode())) {
            EcoImpactAnalysis supplier = newImpact(item, IMPACT_TYPE_SUPPLIER);
            supplier.setObjectCode(material.getSupplierCode());
            supplier.setObjectName(material.getSupplierCode());
            supplier.setImpactDesc("需与供应商确认变更切换时点与供货版本");
            list.add(supplier);
        }
    }

    private void appendProductImpact(List<EcoImpactAnalysis> list, EcoChangeItem item) {
        MdProduct product = findProduct(item.getObjectCode());
        boolean exists = product != null;
        EcoImpactAnalysis impact = newImpact(item, IMPACT_TYPE_CUSTOMER);
        impact.setObjectCode(exists ? product.getCustomerCode() : item.getObjectCode());
        impact.setObjectName(item.getObjectName());
        impact.setCurrentValue(exists ? product.getStatus() : VALUE_PRODUCT_MISSING);
        impact.setImpactDesc("需评估客户项目影响并按客户通知要求同步");
        list.add(impact);
    }

    private void appendDocumentImpact(List<EcoImpactAnalysis> list, EcoChangeItem item) {
        EcoImpactAnalysis impact = newImpact(item, IMPACT_TYPE_BOM);
        impact.setImpactDesc("图文档需按变更后版本重新签审发布并更新受控分发");
        list.add(impact);
    }

    private void appendProcessImpact(List<EcoImpactAnalysis> list, EcoChangeItem item) {
        EcoImpactAnalysis impact = newImpact(item, IMPACT_TYPE_WIP);
        impact.setImpactDesc("需更新工艺文件与作业指导书版本");
        list.add(impact);
    }

    private EcoImpactAnalysis newImpact(EcoChangeItem item, String impactType) {
        EcoImpactAnalysis impact = new EcoImpactAnalysis();
        impact.setEcoId(item.getEcoId());
        impact.setImpactType(impactType);
        impact.setObjectCode(item.getObjectCode());
        impact.setObjectName(item.getObjectName());
        impact.setHandleStatus(HANDLE_STATUS_PENDING);
        return impact;
    }

    private MdMaterial findMaterial(String materialCode) {
        if (!StringUtils.hasText(materialCode)) {
            return null;
        }
        List<MdMaterial> materials = materialMapper.selectList(Wrappers.<MdMaterial>lambdaQuery()
                .eq(MdMaterial::getMaterialCode, materialCode));
        return materials.isEmpty() ? null : materials.get(0);
    }

    private MdProduct findProduct(String productCode) {
        if (!StringUtils.hasText(productCode)) {
            return null;
        }
        List<MdProduct> products = productMapper.selectList(Wrappers.<MdProduct>lambdaQuery()
                .eq(MdProduct::getProductCode, productCode));
        return products.isEmpty() ? null : products.get(0);
    }

    private void applyOrder(EcoChangeOrder order, EcoSaveRequest request) {
        if (StringUtils.hasText(request.getTitle())) {
            order.setTitle(request.getTitle());
        }
        if (StringUtils.hasText(request.getChangeType())) {
            order.setChangeType(request.getChangeType());
        }
        order.setPlanDesc(request.getPlanDesc());
        order.setEffectiveDate(request.getEffectiveDate());
        order.setEffectiveBatch(request.getEffectiveBatch());
        order.setRemark(request.getRemark());
    }

    private void applyItem(EcoChangeItem item, EcoChangeItemSaveRequest request) {
        item.setObjectType(request.getObjectType());
        item.setObjectCode(request.getObjectCode());
        item.setObjectName(request.getObjectName());
        if (StringUtils.hasText(request.getChangeAction())) {
            item.setChangeAction(request.getChangeAction());
        }
        item.setBeforeVersion(request.getBeforeVersion());
        item.setAfterVersion(request.getAfterVersion());
        item.setRemark(request.getRemark());
    }

    private void validateItem(EcoChangeItemSaveRequest request) {
        if (!StringUtils.hasText(request.getObjectType())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "变更对象类型不能为空");
        }
        if (!StringUtils.hasText(request.getObjectCode())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "变更对象编码不能为空");
        }
    }

    /**
     * 生成 ECO 编号：ECO-{yyyyMM}-{4 位流水号}，流水号取同前缀已有记录数 + 1，重复则继续递增。
     */
    private String generateEcoNo() {
        String prefix = buildPrefix(ECO_NO_CODE);
        long seq = changeOrderMapper.selectCount(Wrappers.<EcoChangeOrder>lambdaQuery()
                .likeRight(EcoChangeOrder::getEcoNo, prefix)) + 1;
        String candidate = prefix + String.format("%04d", seq);
        while (changeOrderMapper.selectCount(Wrappers.<EcoChangeOrder>lambdaQuery()
                .eq(EcoChangeOrder::getEcoNo, candidate)) > 0) {
            seq++;
            candidate = prefix + String.format("%04d", seq);
        }
        return candidate;
    }

    /**
     * 生成 ECN 编号：ECN-{yyyyMM}-{4 位流水号}，流水号取同前缀已有记录数 + 1，重复则继续递增。
     */
    private String generateNoticeNo() {
        String prefix = buildPrefix(NOTICE_NO_CODE);
        long seq = noticeMapper.selectCount(Wrappers.<EcoNotice>lambdaQuery()
                .likeRight(EcoNotice::getNoticeNo, prefix)) + 1;
        String candidate = prefix + String.format("%04d", seq);
        while (noticeMapper.selectCount(Wrappers.<EcoNotice>lambdaQuery()
                .eq(EcoNotice::getNoticeNo, candidate)) > 0) {
            seq++;
            candidate = prefix + String.format("%04d", seq);
        }
        return candidate;
    }

    private String buildPrefix(String code) {
        return code + "-" + LocalDate.now().format(MONTH_FORMAT) + "-";
    }

    private EcoChangeOrder requireOrder(Long ecoId) {
        EcoChangeOrder order = changeOrderMapper.selectById(ecoId);
        if (order == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "变更单不存在: " + ecoId);
        }
        return order;
    }

    private EcoChangeItem requireItem(Long itemId) {
        EcoChangeItem item = changeItemMapper.selectById(itemId);
        if (item == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "变更明细不存在: " + itemId);
        }
        return item;
    }

    private EcoNotice requireNotice(Long noticeId) {
        EcoNotice notice = noticeMapper.selectById(noticeId);
        if (notice == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "变更通知不存在: " + noticeId);
        }
        return notice;
    }

    private EcoImpactAnalysis requireImpact(Long impactId) {
        EcoImpactAnalysis impact = impactMapper.selectById(impactId);
        if (impact == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "影响分析记录不存在: " + impactId);
        }
        return impact;
    }
}
