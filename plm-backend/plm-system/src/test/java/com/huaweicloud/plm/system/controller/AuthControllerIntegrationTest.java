package com.huaweicloud.plm.system.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(
        properties = {
                "spring.datasource.url=jdbc:h2:mem:plm2_auth_test;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
                "plm.jwt.secret=plm2-junit-test-secret-0123456789abcdef0123456789"
        }
)
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private Flyway flyway;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void emptyLoginReturnsChineseValidationErrors() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType("application/json")
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message", allOf(
                        containsString("用户名不能为空"),
                        containsString("密码不能为空"))));
    }

    @Test
    void anonymousIdentityAndUserListRequestsAreRejected() throws Exception {
        mockMvc.perform(get("/auth/me"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/system/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void refreshRequiresRefreshTokenAndLogoutRequiresAuthentication() throws Exception {
        String loginResponse = mockMvc.perform(post("/auth/login")
                        .contentType("application/json")
                        .content("{\"username\":\"admin\",\"password\":\"admin123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.refreshToken").isNotEmpty())
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode tokens = objectMapper.readTree(loginResponse).path("data");
        String accessToken = tokens.path("accessToken").asText();
        String refreshToken = tokens.path("refreshToken").asText();

        mockMvc.perform(post("/auth/refresh")
                        .contentType("application/json")
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400));

        mockMvc.perform(post("/auth/refresh")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(Map.of("refreshToken", "not-a-jwt"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(401));

        mockMvc.perform(post("/auth/refresh")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(
                                Map.of("refreshToken", accessToken))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(401));

        mockMvc.perform(post("/auth/refresh")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(
                                Map.of("refreshToken", refreshToken))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.refreshToken").isNotEmpty());

        mockMvc.perform(post("/auth/logout"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post("/auth/logout")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    void onlyMinimalActuatorEndpointsAreAnonymous() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.components").doesNotExist());
        mockMvc.perform(get("/actuator"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/actuator/env"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/h2-console"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void allMigrationsApplyToEmptyH2AndRepeatedMigrationIsIdempotent() {
        int historyCountBefore = appliedMigrationCount();
        assertTrue(historyCountBefore >= 173);
        assertEquals("173", jdbcTemplate.queryForObject(
                "SELECT version FROM flyway_schema_history WHERE success = TRUE ORDER BY installed_rank DESC LIMIT 1",
                String.class));

        flyway.migrate();

        assertEquals(historyCountBefore, appliedMigrationCount());
    }

    @Test
    void rolePermissionAssignmentCanBeRepeatedAndRestorePreviouslyRemovedPermissions() throws Exception {
        String loginResponse = mockMvc.perform(post("/auth/login")
                        .contentType("application/json")
                        .content("{\"username\":\"admin\",\"password\":\"admin123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andReturn()
                .getResponse()
                .getContentAsString();
        String accessToken = objectMapper.readTree(loginResponse).path("data").path("accessToken").asText();

        JsonNode permissions = objectMapper.readTree(mockMvc.perform(get("/system/permissions")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andReturn()
                .getResponse()
                .getContentAsString()).path("data");
        long orgPermissionId = permissionId(permissions, "system:org:list");
        long userPermissionId = permissionId(permissions, "system:user:list");

        String roleResponse = mockMvc.perform(post("/system/roles")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(Map.of(
                                "roleCode", "IT-RP-" + UUID.randomUUID().toString().replace("-", ""),
                                "roleName", "Permission assignment regression",
                                "dataScope", "org",
                                "status", 1))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long roleId = objectMapper.readTree(roleResponse).path("data").asLong();

        assignRolePermissions(accessToken, roleId, List.of(orgPermissionId, userPermissionId));
        assignRolePermissions(accessToken, roleId, List.of(userPermissionId));
        assignRolePermissions(accessToken, roleId, List.of(orgPermissionId, userPermissionId));

        JsonNode assigned = objectMapper.readTree(mockMvc.perform(get("/system/roles/{roleId}/permissions", roleId)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andReturn()
                .getResponse()
                .getContentAsString()).path("data");
        assertEquals(2, assigned.size());
        Set<Long> assignedIds = new HashSet<>();
        assigned.forEach(permissionId -> assignedIds.add(permissionId.asLong()));
        assertEquals(Set.of(orgPermissionId, userPermissionId), assignedIds);
    }

    private int appliedMigrationCount() {
        return jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM flyway_schema_history WHERE success = TRUE",
                Integer.class);
    }

    private long permissionId(JsonNode permissions, String permissionCode) {
        for (JsonNode permission : permissions) {
            if (permissionCode.equals(permission.path("permissionCode").asText())) {
                return permission.path("id").asLong();
            }
        }
        throw new AssertionError("Permission not found: " + permissionCode);
    }

    private void assignRolePermissions(String accessToken, long roleId, List<Long> permissionIds)
            throws Exception {
        mockMvc.perform(put("/system/roles/{roleId}/permissions", roleId)
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(Map.of("permissionIds", permissionIds))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }
}
