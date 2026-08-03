import { createAdminClient } from "./supabase/admin";
import { sendBrevoMail } from "./brevo";
import { sendGraphMail } from "./graphMail";
import { wrapNewsletterEmailTemplate, markdownToEmailHtml } from "./newsletterMarkdown";
import { SITE_URL } from "./site";

/**
 * Emails a community post's author when someone else replies to it. This is a
 * transactional notification directly triggered by the recipient's own
 * action (posting) — not gated by community_profiles.newsletter_opt_in,
 * which governs the separate marketing newsletter. Members can opt out of
 * just this via community_profiles.reply_notifications_opt_out (see
 * supabase_community_setup.sql section 7 for the migration; gracefully
 * defaults to "notify" if that column doesn't exist yet).
 *
 * Fire-and-forget from the caller — never throws, logs and returns instead,
 * so a notification failure can never break the reply itself from posting.
 */
export async function notifyPostAuthorOfReply(postId: string, replyAuthorId: string, replyBody: string): Promise<void> {
  try {
    const admin = createAdminClient();

    const { data: post } = await admin
      .from("community_posts")
      .select("author_id, title, room_id")
      .eq("id", postId)
      .maybeSingle();

    if (!post || post.author_id === replyAuthorId) return;

    const { data: profile } = await admin
      .from("community_profiles")
      .select("display_name, reply_notifications_opt_out")
      .eq("user_id", post.author_id)
      .maybeSingle();

    // profile.reply_notifications_opt_out is undefined (not false) if the
    // column doesn't exist yet — only skip on an explicit true.
    if (profile?.reply_notifications_opt_out === true) return;

    const { data: authUser, error: userError } = await admin.auth.admin.getUserById(post.author_id);
    if (userError || !authUser?.user?.email) {
      console.error("Could not resolve reply-notification recipient email:", userError);
      return;
    }
    const recipientEmail = authUser.user.email;

    const { data: room } = await admin.from("community_rooms").select("slug").eq("id", post.room_id).maybeSingle();
    const threadUrl = `${SITE_URL}/community/${room?.slug || ""}/${postId}`;

    const excerpt = replyBody.length > 200 ? `${replyBody.slice(0, 200)}…` : replyBody;
    const subject = `New reply to your post: "${post.title}"`;

    const contentHtml = markdownToEmailHtml(
      `Someone replied to your post **"${post.title}"** in the Lincolnshire Knee Clinic Patient Community.\n\n> ${excerpt}\n\n[View the full conversation](${threadUrl})`
    );

    const footerHtml = `
      <p style="margin: 24px 0 0 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
        You received this email because you have a post in the Lincolnshire Knee Clinic Patient Community that just received a reply.
        <br />
        <a href="${SITE_URL}/community/account" style="color: #14b8a6; text-decoration: underline; font-weight: bold;">Manage notification preferences</a>
      </p>
    `;

    const html = wrapNewsletterEmailTemplate(subject, contentHtml, { footerHtml, includePoll: false });

    const hasBrevo = Boolean(process.env.BREVO_API_KEY);
    const hasMSGraph = Boolean(
      process.env.MS_GRAPH_TENANT_ID && process.env.MS_GRAPH_CLIENT_ID && process.env.MS_GRAPH_CLIENT_SECRET
    );

    if (hasBrevo) {
      await sendBrevoMail(subject, html, recipientEmail, profile?.display_name);
    } else if (hasMSGraph) {
      await sendGraphMail(subject, html, recipientEmail);
    } else {
      console.warn(`[Community Reply Notification Simulation] Would notify ${recipientEmail} about a reply to "${post.title}"`);
    }
  } catch (error) {
    console.error("Failed to send community reply notification:", error);
  }
}
