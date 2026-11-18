package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.VoteQuery;
import com.huaweicloud.plm.system.dto.VoteSaveRequest;
import com.huaweicloud.plm.system.entity.OaOaVote;
import com.huaweicloud.plm.system.entity.OaOaVoteOption;
import com.huaweicloud.plm.system.entity.OaOaVoteRecord;
import com.huaweicloud.plm.system.entity.SysUser;
import com.huaweicloud.plm.system.mapper.OaOaVoteMapper;
import com.huaweicloud.plm.system.mapper.OaOaVoteOptionMapper;
import com.huaweicloud.plm.system.mapper.OaOaVoteRecordMapper;
import com.huaweicloud.plm.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 协同办公投票服务：投票的草稿维护、选项管理、发布关闭与投票计票。
 */
@Service
@RequiredArgsConstructor
public class OaVoteService {

    public static final String STATUS_DRAFT = "DRAFT";
    public static final String STATUS_RUNNING = "RUNNING";
    public static final String STATUS_CLOSED = "CLOSED";

    public static final String TYPE_SINGLE = "SINGLE";
    public static final String TYPE_MULTI = "MULTI";

    private static final String NO_PREFIX = "VOTE";

    private final OaOaVoteMapper voteMapper;
    private final OaOaVoteOptionMapper voteOptionMapper;
    private final OaOaVoteRecordMapper voteRecordMapper;
    private final HrFlowSupport flowSupport;
    private final SysUserMapper userMapper;

    /** 投票详情：投票主表与其选项集合。 */
    public record VoteDetail(OaOaVote vote, List<OaOaVoteOption> options) {
    }

    /** 投票分页：按状态与关键词过滤，按主键倒序。 */
    public PageResult<OaOaVote> page(VoteQuery query) {
        Page<OaOaVote> page = query.toPage();
        voteMapper.selectPage(page, Wrappers.<OaOaVote>lambdaQuery()
                .eq(StringUtils.hasText(query.getVoteStatus()), OaOaVote::getVoteStatus, query.getVoteStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaOaVote::getTitle, query.getKeyword()).or()
                        .like(OaOaVote::getDescription, query.getKeyword()))
                .orderByDesc(OaOaVote::getId));
        return PageResult.of(page);
    }

    public VoteDetail detail(Long id) {
        OaOaVote vote = requireVote(id);
        List<OaOaVoteOption> options = voteOptionMapper.selectList(Wrappers.<OaOaVoteOption>lambdaQuery()
                .eq(OaOaVoteOption::getVoteId, id)
                .orderByAsc(OaOaVoteOption::getSortNo));
        return new VoteDetail(vote, options);
    }

    public OaOaVote requireVote(Long id) {
        OaOaVote vote = voteMapper.selectById(id);
        if (vote == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "投票不存在: " + id);
        }
        return vote;
    }

    /** 新建投票：默认草稿状态，生成编号并写入选项。 */
    @Transactional
    public Long create(VoteSaveRequest request) {
        OaOaVote vote = new OaOaVote();
        applyRequest(vote, request);
        vote.setVoteNo(flowSupport.nextNo(NO_PREFIX));
        vote.setVoteStatus(STATUS_DRAFT);
        Long userId = UserContext.getUserId();
        vote.setCreatorUserId(userId);
        vote.setCreatorName(resolveDisplayName(userId));
        voteMapper.insert(vote);
        saveOptions(vote.getId(), request.getOptions());
        return vote.getId();
    }

    /** 更新投票：仅草稿状态可改，选项整体重建。 */
    @Transactional
    public void update(Long id, VoteSaveRequest request) {
        OaOaVote vote = requireVote(id);
        if (!STATUS_DRAFT.equals(vote.getVoteStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅草稿状态的投票可修改: " + id);
        }
        applyRequest(vote, request);
        voteMapper.updateById(vote);
        voteOptionMapper.delete(Wrappers.<OaOaVoteOption>lambdaQuery().eq(OaOaVoteOption::getVoteId, id));
        saveOptions(id, request.getOptions());
    }

    /** 发布投票：草稿 → 进行中。 */
    @Transactional
    public void publish(Long id) {
        OaOaVote vote = requireVote(id);
        if (!STATUS_DRAFT.equals(vote.getVoteStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅草稿状态的投票可发布: " + id);
        }
        vote.setVoteStatus(STATUS_RUNNING);
        voteMapper.updateById(vote);
    }

    /** 关闭投票：进行中 → 已关闭。 */
    @Transactional
    public void close(Long id) {
        OaOaVote vote = requireVote(id);
        if (!STATUS_RUNNING.equals(vote.getVoteStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅进行中的投票可关闭: " + id);
        }
        vote.setVoteStatus(STATUS_CLOSED);
        voteMapper.updateById(vote);
    }

    /** 参与投票：校验状态、重复投票与选项合法性，写入记录并递增选项票数。 */
    @Transactional
    public void castVote(Long id, List<Long> optionIds) {
        OaOaVote vote = requireVote(id);
        if (!STATUS_RUNNING.equals(vote.getVoteStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "投票未开始或已结束: " + id);
        }
        if (optionIds == null || optionIds.isEmpty()) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "请选择投票选项");
        }
        Long userId = UserContext.getUserId();
        if (userId == null) {
            throw new BusinessException(ResultCode.UNAUTHORIZED, "未获取到当前登录用户");
        }
        long voted = voteRecordMapper.selectCount(Wrappers.<OaOaVoteRecord>lambdaQuery()
                .eq(OaOaVoteRecord::getVoteId, id)
                .eq(OaOaVoteRecord::getVoterUserId, userId));
        if (voted > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "您已参与过该投票");
        }
        if (TYPE_SINGLE.equals(vote.getVoteType()) && optionIds.size() != 1) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "单选投票只能选择一个选项");
        }
        long matched = voteOptionMapper.selectCount(Wrappers.<OaOaVoteOption>lambdaQuery()
                .eq(OaOaVoteOption::getVoteId, id)
                .in(OaOaVoteOption::getId, optionIds));
        if (matched != optionIds.size()) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "存在无效的投票选项");
        }
        String voterName = resolveDisplayName(userId);
        LocalDateTime now = LocalDateTime.now();
        for (Long optionId : optionIds) {
            OaOaVoteRecord record = new OaOaVoteRecord();
            record.setVoteId(id);
            record.setOptionId(optionId);
            record.setVoterUserId(userId);
            record.setVoterName(voterName);
            record.setVotedAt(now);
            voteRecordMapper.insert(record);
            voteOptionMapper.update(null, Wrappers.<OaOaVoteOption>lambdaUpdate()
                    .eq(OaOaVoteOption::getId, optionId)
                    .setSql("vote_count = vote_count + 1"));
        }
    }

    /** 删除投票：仅草稿状态可删，同时清理选项。 */
    @Transactional
    public void delete(Long id) {
        OaOaVote vote = requireVote(id);
        if (!STATUS_DRAFT.equals(vote.getVoteStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅草稿状态的投票可删除: " + id);
        }
        voteOptionMapper.delete(Wrappers.<OaOaVoteOption>lambdaQuery().eq(OaOaVoteOption::getVoteId, id));
        voteMapper.deleteById(id);
    }

    private void saveOptions(Long voteId, List<String> options) {
        if (options == null || options.isEmpty()) {
            return;
        }
        int index = 0;
        for (String text : options) {
            if (!StringUtils.hasText(text)) {
                continue;
            }
            OaOaVoteOption option = new OaOaVoteOption();
            option.setVoteId(voteId);
            option.setOptionText(text);
            option.setVoteCount(0);
            option.setSortNo(++index);
            voteOptionMapper.insert(option);
        }
    }

    private void applyRequest(OaOaVote vote, VoteSaveRequest request) {
        vote.setTitle(request.getTitle());
        vote.setDescription(request.getDescription());
        vote.setVoteType(request.getVoteType());
        vote.setAnonymousFlag(request.getAnonymousFlag());
        vote.setMaxChoice(request.getMaxChoice());
        vote.setStartAt(request.getStartAt());
        vote.setEndAt(request.getEndAt());
        vote.setPublishScope(request.getPublishScope());
        vote.setScopeValue(request.getScopeValue());
        vote.setRemark(request.getRemark());
    }

    private String resolveDisplayName(Long userId) {
        if (userId == null) {
            return null;
        }
        SysUser user = userMapper.selectById(userId);
        if (user == null) {
            return null;
        }
        return StringUtils.hasText(user.getDisplayName()) ? user.getDisplayName() : user.getUsername();
    }
}
