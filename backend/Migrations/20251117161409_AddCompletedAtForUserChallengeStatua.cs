using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gamified_learning.Migrations
{
    /// <inheritdoc />
    public partial class AddCompletedAtForUserChallengeStatua : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedAt",
                table: "UserChallengesStatus",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompletedAt",
                table: "UserChallengesStatus");
        }
    }
}
