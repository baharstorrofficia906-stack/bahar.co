import { useQueryClient } from "@tanstack/react-query";
import { useGetMessages, useMarkMessageRead } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Mail, MailOpen, Reply, Clock, User, AtSign } from "lucide-react";

export default function ManageMessages() {
  const queryClient = useQueryClient();
  const { data: messages, isLoading } = useGetMessages();
  const markRead = useMarkMessageRead();

  const unread = messages?.filter((m) => !m.read).length ?? 0;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-secondary">Customer Messages</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {unread > 0 ? (
              <span className="font-semibold text-blue-600">{unread} unread message{unread !== 1 ? "s" : ""}</span>
            ) : (
              "All messages read"
            )}
            {messages ? ` · ${messages.length} total` : ""}
          </p>
        </div>
        {unread > 0 && (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-700 font-bold text-sm">{unread}</span>
          </div>
        )}
      </div>

      {/* Messages List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-white rounded-2xl animate-pulse border border-border" />
          ))}
        </div>
      ) : !messages || messages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-border p-16 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail size={28} className="text-muted-foreground" />
          </div>
          <h3 className="font-serif text-xl text-secondary mb-2">No messages yet</h3>
          <p className="text-muted-foreground text-sm">Customer messages from the contact form will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                msg.read ? "border-border opacity-80" : "border-blue-200 shadow-blue-50"
              }`}
            >
              {/* Unread indicator strip */}
              {!msg.read && <div className="h-1 w-full bg-gradient-to-r from-blue-400 to-blue-600" />}

              <div className="p-6">
                {/* Top row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      msg.read ? "bg-muted text-muted-foreground" : "bg-blue-100 text-blue-600"
                    }`}>
                      {msg.read ? <MailOpen size={18} /> : <Mail size={18} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-secondary flex items-center gap-1.5">
                          <User size={13} className="text-muted-foreground" />
                          {msg.name}
                        </span>
                        {!msg.read && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <a
                        href={`mailto:${msg.email}`}
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <AtSign size={12} />
                        {msg.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {msg.createdAt && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(msg.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Subject */}
                {msg.subject && (
                  <h4 className="font-semibold text-secondary mb-2 text-sm">{msg.subject}</h4>
                )}

                {/* Message body */}
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap bg-muted/40 rounded-xl p-4">
                  {msg.message}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                  <a
                    href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject ?? "Your message to Bahar")}`}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-secondary text-white rounded-xl hover:bg-secondary/80 transition-colors"
                  >
                    <Reply size={15} />
                    Reply via Email
                  </a>

                  {!msg.read && (
                    <button
                      onClick={() =>
                        markRead.mutate({ id: msg.id }, { onSuccess: () => queryClient.invalidateQueries() })
                      }
                      disabled={markRead.isPending}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-50"
                    >
                      <MailOpen size={15} />
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
