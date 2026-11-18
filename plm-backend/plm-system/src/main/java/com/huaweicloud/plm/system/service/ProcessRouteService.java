package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.ProcessOperationSaveRequest;
import com.huaweicloud.plm.system.dto.ProcessRouteDetailResponse;
import com.huaweicloud.plm.system.dto.ProcessRouteQuery;
import com.huaweicloud.plm.system.dto.ProcessRouteSaveRequest;
import com.huaweicloud.plm.system.entity.InspectionSpec;
import com.huaweicloud.plm.system.entity.ProcessOperation;
import com.huaweicloud.plm.system.entity.ProcessRoute;
import com.huaweicloud.plm.system.mapper.InspectionSpecMapper;
import com.huaweicloud.plm.system.mapper.ProcessOperationMapper;
import com.huaweicloud.plm.system.mapper.ProcessRouteMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 工艺路线服务（DEV-047）：路线与工序明细维护、发布、按产品反查及工序检验规范匹配。
 */
@Service
@RequiredArgsConstructor
public class ProcessRouteService {

    private static final String DEFAULT_VERSION = "V1";
    private static final String STATUS_DRAFT = "draft";
    private static final String STATUS_RELEASED = "released";

    /** 工序与检验规范匹配规则配置项。 */
    private static final String CONFIG_OPERATION_INSPECTION_MATCH = "process.operation.inspection.match";
    private static final String DEFAULT_OPERATION_INSPECTION_MATCH = "按产品+工序+版本自动匹配";

    /** 工序未配置检验规范编码时，兜底按制程检验（ipqc）匹配。 */
    private static final String FALLBACK_INSPECTION_TYPE = "ipqc";

    private final ProcessRouteMapper processRouteMapper;
    private final ProcessOperationMapper processOperationMapper;
    private final InspectionSpecMapper inspectionSpecMapper;
    private final ConfigService configService;

    public PageResult<ProcessRoute> page(ProcessRouteQuery query) {
        Page<ProcessRoute> page = query.toPage();
        processRouteMapper.selectPage(page, Wrappers.<ProcessRoute>lambdaQuery()
                .eq(StringUtils.hasText(query.getRouteCode()), ProcessRoute::getRouteCode, query.getRouteCode())
                .eq(StringUtils.hasText(query.getProductCode()), ProcessRoute::getProductCode, query.getProductCode())
                .eq(StringUtils.hasText(query.getStatus()), ProcessRoute::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ProcessRoute::getRouteCode, query.getKeyword()).or()
                        .like(ProcessRoute::getRouteName, query.getKeyword()))
                .orderByDesc(ProcessRoute::getCreatedAt)
                .orderByDesc(ProcessRoute::getId));
        return PageResult.of(page);
    }

    public ProcessRouteDetailResponse detail(Long routeId) {
        ProcessRoute route = requireRoute(routeId);
        ProcessRouteDetailResponse response = new ProcessRouteDetailResponse();
        response.setRoute(route);
        response.setOperations(listOperations(routeId));
        return response;
    }

    /**
     * 按产品编码反查生效工艺路线：仅取 status=released，按版本号倒序、同版本取 id 最大的最新一条。
     */
    public ProcessRoute findReleasedByProduct(String productCode) {
        if (!StringUtils.hasText(productCode)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "产品编码不能为空");
        }
        List<ProcessRoute> routes = processRouteMapper.selectList(Wrappers.<ProcessRoute>lambdaQuery()
                .eq(ProcessRoute::getProductCode, productCode)
                .eq(ProcessRoute::getStatus, STATUS_RELEASED)
                .orderByDesc(ProcessRoute::getVersionNo)
                .orderByDesc(ProcessRoute::getId));
        return routes.isEmpty() ? null : routes.get(0);
    }

    @Transactional
    public Long create(ProcessRouteSaveRequest request) {
        String versionNo = StringUtils.hasText(request.getVersionNo()) ? request.getVersionNo() : DEFAULT_VERSION;
        ensureUnique(request.getRouteCode(), versionNo, -1L);
        ProcessRoute route = new ProcessRoute();
        applyRoute(route, request, versionNo);
        route.setStatus(StringUtils.hasText(request.getStatus()) ? request.getStatus() : STATUS_DRAFT);
        processRouteMapper.insert(route);
        replaceOperations(route.getId(), request.getOperations());
        return route.getId();
    }

    @Transactional
    public void update(Long routeId, ProcessRouteSaveRequest request) {
        ProcessRoute route = requireRoute(routeId);
        if (STATUS_RELEASED.equalsIgnoreCase(route.getStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "已发布的工艺路线不允许修改");
        }
        String versionNo = StringUtils.hasText(request.getVersionNo()) ? request.getVersionNo() : route.getVersionNo();
        ensureUnique(request.getRouteCode(), versionNo, routeId);
        applyRoute(route, request, versionNo);
        if (StringUtils.hasText(request.getStatus())) {
            route.setStatus(request.getStatus());
        }
        processRouteMapper.updateById(route);
        replaceOperations(routeId, request.getOperations());
    }

    @Transactional
    public void delete(Long routeId) {
        ProcessRoute route = requireRoute(routeId);
        if (STATUS_RELEASED.equalsIgnoreCase(route.getStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "已发布的工艺路线不允许删除");
        }
        processOperationMapper.delete(Wrappers.<ProcessOperation>lambdaQuery()
                .eq(ProcessOperation::getRouteId, routeId));
        processRouteMapper.deleteById(routeId);
    }

    /** 仅维护工序明细：整体替换。 */
    @Transactional
    public void saveOperations(Long routeId, List<ProcessOperationSaveRequest> operations) {
        requireRoute(routeId);
        replaceOperations(routeId, operations);
    }

    /**
     * 发布：至少 1 条工序，工序编码与工序号在同一路线内均不允许重复。
     */
    @Transactional
    public void release(Long routeId) {
        ProcessRoute route = requireRoute(routeId);
        List<ProcessOperation> operations = listOperations(routeId);
        if (operations.isEmpty()) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "至少需要 1 条工序才能发布");
        }
        Set<String> operationCodes = new HashSet<>();
        Set<Integer> seqNos = new HashSet<>();
        for (ProcessOperation operation : operations) {
            if (!operationCodes.add(operation.getOperationCode())) {
                throw new BusinessException(ResultCode.BAD_REQUEST,
                        "工序编码在同一路线内不允许重复: " + operation.getOperationCode());
            }
            if (!seqNos.add(operation.getSeqNo())) {
                throw new BusinessException(ResultCode.BAD_REQUEST,
                        "工序号不允许重复: " + operation.getSeqNo());
            }
        }
        route.setStatus(STATUS_RELEASED);
        processRouteMapper.updateById(route);
    }

    /**
     * 工序关联检验规范查询：工序配置了检验规范编码时按其查已发布规范；
     * 未配置时读取配置 process.operation.inspection.match，并按路线产品的制程检验规范兜底匹配。
     */
    public OperationInspectionSpec findOperationInspectionSpec(Long routeId, Long operationId) {
        ProcessRoute route = requireRoute(routeId);
        ProcessOperation operation = requireOperation(routeId, operationId);
        if (StringUtils.hasText(operation.getInspectionSpecCode())) {
            return new OperationInspectionSpec(findReleasedSpecByCode(operation.getInspectionSpecCode()), null);
        }
        String matchRule = resolveOperationInspectionMatch();
        InspectionSpec fallback = matchByProductAndType(route.getProductCode());
        String message = "工序未配置检验规范编码，已按配置规则（" + matchRule + "）尝试自动匹配"
                + (fallback == null ? "，未找到匹配的生效检验规范" : "");
        return new OperationInspectionSpec(fallback, message);
    }

    public List<ProcessOperation> listOperations(Long routeId) {
        return processOperationMapper.selectList(Wrappers.<ProcessOperation>lambdaQuery()
                .eq(ProcessOperation::getRouteId, routeId)
                .orderByAsc(ProcessOperation::getSeqNo)
                .orderByAsc(ProcessOperation::getId));
    }

    private void replaceOperations(Long routeId, List<ProcessOperationSaveRequest> operations) {
        processOperationMapper.delete(Wrappers.<ProcessOperation>lambdaQuery()
                .eq(ProcessOperation::getRouteId, routeId));
        if (operations == null) {
            return;
        }
        int index = 1;
        for (ProcessOperationSaveRequest request : operations) {
            ProcessOperation operation = new ProcessOperation();
            operation.setRouteId(routeId);
            operation.setSeqNo(request.getSeqNo() == null ? index : request.getSeqNo());
            applyOperation(operation, request);
            processOperationMapper.insert(operation);
            index++;
        }
    }

    private InspectionSpec findReleasedSpecByCode(String specCode) {
        List<InspectionSpec> specs = inspectionSpecMapper.selectList(Wrappers.<InspectionSpec>lambdaQuery()
                .eq(InspectionSpec::getSpecCode, specCode)
                .eq(InspectionSpec::getStatus, STATUS_RELEASED)
                .orderByDesc(InspectionSpec::getVersionNo)
                .orderByDesc(InspectionSpec::getId));
        return specs.isEmpty() ? null : specs.get(0);
    }

    private InspectionSpec matchByProductAndType(String productCode) {
        if (!StringUtils.hasText(productCode)) {
            return null;
        }
        List<InspectionSpec> specs = inspectionSpecMapper.selectList(Wrappers.<InspectionSpec>lambdaQuery()
                .eq(InspectionSpec::getStatus, STATUS_RELEASED)
                .eq(InspectionSpec::getInspectionType, FALLBACK_INSPECTION_TYPE)
                .eq(InspectionSpec::getProductCode, productCode)
                .orderByDesc(InspectionSpec::getId));
        return specs.isEmpty() ? null : specs.get(0);
    }

    private String resolveOperationInspectionMatch() {
        String value = configService.getValue(CONFIG_OPERATION_INSPECTION_MATCH);
        return StringUtils.hasText(value) ? value : DEFAULT_OPERATION_INSPECTION_MATCH;
    }

    private void applyRoute(ProcessRoute route, ProcessRouteSaveRequest request, String versionNo) {
        route.setRouteCode(request.getRouteCode());
        route.setRouteName(request.getRouteName());
        route.setProductCode(request.getProductCode());
        route.setProductName(request.getProductName());
        route.setVersionNo(versionNo);
        route.setProcessVersion(request.getProcessVersion());
        route.setEffectiveDate(request.getEffectiveDate());
        route.setDescription(request.getDescription());
        route.setRemark(request.getRemark());
    }

    private void applyOperation(ProcessOperation operation, ProcessOperationSaveRequest request) {
        operation.setOperationCode(request.getOperationCode());
        operation.setOperationName(request.getOperationName());
        operation.setWorkCenter(request.getWorkCenter());
        operation.setProcessParams(request.getProcessParams());
        operation.setFixtureTooling(request.getFixtureTooling());
        operation.setWorkInstructionDocNo(request.getWorkInstructionDocNo());
        operation.setStandardTime(request.getStandardTime());
        operation.setInspectionRequired(request.getInspectionRequired() == null ? 1 : request.getInspectionRequired());
        operation.setInspectionSpecCode(request.getInspectionSpecCode());
        operation.setKeyOperation(request.getKeyOperation() == null ? 0 : request.getKeyOperation());
        operation.setRemark(request.getRemark());
    }

    private void ensureUnique(String routeCode, String versionNo, Long excludeId) {
        if (processRouteMapper.countByCode(routeCode, versionNo, excludeId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT,
                    "已存在相同路线编码 + 版本号的工艺路线: " + routeCode + "/" + versionNo);
        }
    }

    private ProcessRoute requireRoute(Long routeId) {
        ProcessRoute route = processRouteMapper.selectById(routeId);
        if (route == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "工艺路线不存在: " + routeId);
        }
        return route;
    }

    private ProcessOperation requireOperation(Long routeId, Long operationId) {
        ProcessOperation operation = processOperationMapper.selectById(operationId);
        if (operation == null || !routeId.equals(operation.getRouteId())) {
            throw new BusinessException(ResultCode.NOT_FOUND, "工序不存在: " + operationId);
        }
        return operation;
    }

    /**
     * 工序关联检验规范查询结果：匹配到的规范（可能为空）与提示信息。
     */
    public record OperationInspectionSpec(InspectionSpec spec, String message) {
    }
}
