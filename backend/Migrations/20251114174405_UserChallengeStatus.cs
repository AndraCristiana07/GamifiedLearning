using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gamified_learning.Migrations
{
    /// <inheritdoc />
    public partial class UserChallengeStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_UserChallengesStatus_ChallengeId",
                table: "UserChallengesStatus",
                column: "ChallengeId");

            migrationBuilder.CreateIndex(
                name: "IX_UserChallengesStatus_UserId",
                table: "UserChallengesStatus",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserChallengesStatus_Challenges_ChallengeId",
                table: "UserChallengesStatus",
                column: "ChallengeId",
                principalTable: "Challenges",
                principalColumn: "ChallengeId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserChallengesStatus_Users_UserId",
                table: "UserChallengesStatus",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserChallengesStatus_Challenges_ChallengeId",
                table: "UserChallengesStatus");

            migrationBuilder.DropForeignKey(
                name: "FK_UserChallengesStatus_Users_UserId",
                table: "UserChallengesStatus");

            migrationBuilder.DropIndex(
                name: "IX_UserChallengesStatus_ChallengeId",
                table: "UserChallengesStatus");

            migrationBuilder.DropIndex(
                name: "IX_UserChallengesStatus_UserId",
                table: "UserChallengesStatus");
        }
    }
}
